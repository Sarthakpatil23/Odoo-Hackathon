const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/audit-cycles
// Restricted to Admin and AssetManager
router.post('/audit-cycles', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { scope, startDate, endDate, auditorIds } = req.body;

  if (!scope || !startDate || !endDate || !auditorIds || !auditorIds.length) {
    return res.status(400).json({ error: 'scope, startDate, endDate, and auditorIds (non-empty array) are required.' });
  }

  try {
    // Check if auditors exist
    const auditors = await prisma.user.findMany({
      where: { id: { in: auditorIds } }
    });
    if (auditors.length !== auditorIds.length) {
      return res.status(400).json({ error: 'One or more selected auditors do not exist.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the AuditCycle
      const cycle = await tx.auditCycle.create({
        data: {
          scope: scope.trim(),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'Open',
        }
      });

      // 2. Fetch in-scope assets (all active non-retired/non-disposed assets)
      const assets = await tx.asset.findMany({
        where: {
          status: { notIn: ['Retired', 'Disposed'] }
        },
        select: { id: true }
      });

      if (assets.length > 0) {
        // 3. Round-robin assign each asset to an auditor
        const auditItemsData = assets.map((asset, idx) => {
          const auditorId = auditorIds[idx % auditorIds.length];
          return {
            auditCycleId: cycle.id,
            assetId: asset.id,
            auditorId,
            result: 'Pending'
          };
        });

        await tx.auditItem.createMany({
          data: auditItemsData
        });
      }

      return cycle;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error('[POST /api/audit-cycles error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/audit-cycles
// Admins see all; auditors see cycles where they have assigned tasks
router.get('/audit-cycles', authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role !== 'Admin' && req.user.role !== 'AssetManager') {
      where = {
        auditItems: {
          some: { auditorId: req.user.id }
        }
      };
    }

    const cycles = await prisma.auditCycle.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(cycles);
  } catch (error) {
    console.error('[GET /api/audit-cycles error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/audit-cycles/:id/items
// List audit items. Auditors only see their own assigned items
router.get('/audit-cycles/:id/items', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const cycle = await prisma.auditCycle.findUnique({ where: { id } });
    if (!cycle) {
      return res.status(404).json({ error: 'Audit cycle not found.' });
    }

    let itemWhere = { auditCycleId: id };
    if (req.user.role !== 'Admin' && req.user.role !== 'AssetManager') {
      itemWhere.auditorId = req.user.id;
    }

    const items = await prisma.auditItem.findMany({
      where: itemWhere,
      include: {
        asset: {
          select: { tag: true, name: true, location: true }
        },
        auditor: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        asset: { tag: 'asc' }
      }
    });

    res.json(items);

  } catch (error) {
    console.error('[GET /api/audit-cycles/:id/items error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/audit-items/:id
// Restricted to the assigned auditor or Admin/AssetManager
router.patch('/audit-items/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { result } = req.body;

  const validResults = ['Verified', 'Missing', 'Damaged'];
  if (!result || !validResults.includes(result)) {
    return res.status(400).json({ error: 'Result must be one of: Verified, Missing, Damaged' });
  }

  try {
    const item = await prisma.auditItem.findUnique({
      where: { id },
      include: { auditCycle: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Audit item not found.' });
    }

    if (item.auditCycle.status === 'Closed') {
      return res.status(400).json({ error: 'Cannot update items in a closed audit cycle.' });
    }

    // Authorization: only the assigned auditor or Admin/Manager can write
    const isAssigned = item.auditorId === req.user.id;
    const isManager = req.user.role === 'Admin' || req.user.role === 'AssetManager';

    if (!isAssigned && !isManager) {
      return res.status(403).json({ error: 'You are not authorized to audit this item.' });
    }

    const updated = await prisma.auditItem.update({
      where: { id },
      data: { result },
      include: {
        asset: { select: { tag: true, name: true } }
      }
    });

    res.json(updated);

  } catch (error) {
    console.error('[PATCH /api/audit-items/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/audit-cycles/:id/close
// Restricted to Admin and AssetManager
router.patch('/audit-cycles/:id/close', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        auditItems: {
          include: { asset: { select: { tag: true, name: true } } }
        }
      }
    });

    if (!cycle) {
      return res.status(404).json({ error: 'Audit cycle not found.' });
    }

    if (cycle.status === 'Closed') {
      return res.status(400).json({ error: 'Audit cycle is already closed.' });
    }

    // Process close operations atomically
    const discrepancies = await prisma.$transaction(async (tx) => {
      // 1. Close cycle status
      await tx.auditCycle.update({
        where: { id },
        data: { status: 'Closed' }
      });

      // 2. Loop through audit items to update asset statuses
      const missingItems = cycle.auditItems.filter(item => item.result === 'Missing');
      for (const item of missingItems) {
        await tx.asset.update({
          where: { id: item.assetId },
          data: { status: 'Lost' }
        });
      }

      // 3. Return a discrepancies list (all items not marked Verified)
      const discrepancyItems = await tx.auditItem.findMany({
        where: {
          auditCycleId: id,
          result: { not: 'Verified' }
        },
        include: {
          asset: { select: { tag: true, name: true } },
          auditor: { select: { name: true } }
        }
      });

      return discrepancyItems;
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Closed audit cycle "${cycle.scope}" (ID: ${id}) and generated discrepancies report.`,
        entityType: 'AuditCycle',
        entityId: id
      }
    });

    res.json({
      message: 'Audit cycle successfully closed.',
      discrepancies
    });

  } catch (error) {
    console.error('[PATCH /api/audit-cycles/:id/close error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

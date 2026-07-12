const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/maintenance
// Raised by any authenticated employee
router.post('/', authenticate, async (req, res) => {
  const { assetId, issue, priority, photoUrl } = req.body;
  const raisedById = req.user.id;

  if (!assetId || !issue || !priority) {
    return res.status(400).json({ error: 'assetId, issue, and priority are required.' });
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        raisedById,
        issue: issue.trim(),
        priority, // Low, Medium, High
        photoUrl: photoUrl ? photoUrl.trim() : null,
        status: 'Pending',
      },
      include: {
        asset: { select: { tag: true, name: true } },
        raisedBy: { select: { name: true } }
      }
    });

    // Notify Admins and Asset Managers
    const managers = await prisma.user.findMany({
      where: {
        role: { in: ['Admin', 'AssetManager'] },
        status: 'Active'
      },
      select: { id: true }
    });

    for (const m of managers) {
      await prisma.notification.create({
        data: {
          userId: m.id,
          type: 'MaintenanceRequestRaised',
          message: `New maintenance requested for ${request.asset.tag} by ${request.raisedBy.name}: "${request.issue}"`
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: raisedById,
        action: `Raised maintenance request for ${request.asset.tag} with ${priority} priority.`,
        entityType: 'Asset',
        entityId: assetId
      }
    });

    res.status(201).json(request);

  } catch (error) {
    console.error('[POST /api/maintenance error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/maintenance
// Scoped by user role
router.get('/', authenticate, async (req, res) => {
  const { status, scheduled } = req.query;

  try {
    // Get user details for department heads
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true }
    });
    const userDeptId = user?.departmentId;

    let roleWhere = {};
    if (req.user.role === 'Employee') {
      roleWhere = { raisedById: req.user.id };
    } else if (req.user.role === 'DepartmentHead') {
      if (!userDeptId) {
        roleWhere = { raisedById: req.user.id };
      } else {
        roleWhere = {
          raisedBy: { departmentId: userDeptId }
        };
      }
    } else {
      // Admin and AssetManager see all
      roleWhere = {};
    }

    const queryWhere = { AND: [roleWhere] };

    if (status) {
      queryWhere.AND.push({ status });
    }

    if (scheduled === 'today') {
      // Maintenance today = status in Approved, TechnicianAssigned, InProgress and updated today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      queryWhere.AND.push({
        status: { in: ['Approved', 'TechnicianAssigned', 'InProgress'] },
        updatedAt: { gte: startOfToday }
      });
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: queryWhere,
      include: {
        asset: {
          select: { id: true, tag: true, name: true, status: true, category: { select: { name: true } } }
        },
        raisedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(requests);

  } catch (error) {
    console.error('[GET /api/maintenance error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/maintenance/:id/approve
// Restricted to Admin and AssetManager
router.patch('/:id/approve', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: { select: { tag: true } } }
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request is not in Pending status.' });
    }

    // Atomic transaction: approve maintenance and flip asset status to UnderMaintenance
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedById: req.user.id
        }
      });

      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'UnderMaintenance' }
      });
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.raisedById,
        type: 'MaintenanceApproved',
        message: `Your maintenance request for asset ${request.asset.tag} was approved.`
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Approved maintenance request for asset ${request.asset.tag}`,
        entityType: 'Asset',
        entityId: request.assetId
      }
    });

    res.json({ message: 'Maintenance request approved.' });

  } catch (error) {
    console.error('[PATCH /api/maintenance/:id/approve error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/maintenance/:id/reject
// Restricted to Admin and AssetManager
router.patch('/:id/reject', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: { select: { tag: true } } }
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Request is not in Pending status.' });
    }

    await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'Rejected',
        approvedById: req.user.id
      }
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.raisedById,
        type: 'MaintenanceRejected',
        message: `Your maintenance request for asset ${request.asset.tag} was rejected.`
      }
    });

    res.json({ message: 'Maintenance request rejected.' });

  } catch (error) {
    console.error('[PATCH /api/maintenance/:id/reject error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/maintenance/:id/assign
// Restricted to Admin and AssetManager
router.patch('/:id/assign', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;
  const { technician } = req.body;

  if (!technician || technician.trim() === '') {
    return res.status(400).json({ error: 'Technician name is required.' });
  }

  try {
    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'TechnicianAssigned',
        technician: technician.trim()
      }
    });

    res.json(updated);

  } catch (error) {
    console.error('[PATCH /api/maintenance/:id/assign error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/maintenance/:id/start
// Restricted to Admin and AssetManager
router.patch('/:id/start', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'InProgress' }
    });

    res.json(updated);

  } catch (error) {
    console.error('[PATCH /api/maintenance/:id/start error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/maintenance/:id/resolve
// Restricted to Admin and AssetManager
router.patch('/:id/resolve', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: { select: { tag: true, status: true } }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    // Atomic transaction: mark resolved and flip asset status back to Available
    // Unless the asset is Retired or Disposed
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceRequest.update({
        where: { id },
        data: { status: 'Resolved' }
      });

      if (request.asset.status !== 'Retired' && request.asset.status !== 'Disposed') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'Available' }
        });
      }
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.raisedById,
        type: 'MaintenanceResolved',
        message: `Maintenance completed for asset ${request.asset.tag}. It is now back online.`
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Marked maintenance resolved for asset ${request.asset.tag}`,
        entityType: 'Asset',
        entityId: request.assetId
      }
    });

    res.json({ message: 'Maintenance request resolved.' });

  } catch (error) {
    console.error('[PATCH /api/maintenance/:id/resolve error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

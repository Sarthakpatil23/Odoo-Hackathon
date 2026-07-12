const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/allocations
// Restricted to Admin, AssetManager, DepartmentHead
router.post('/', authenticate, authorize('Admin', 'AssetManager', 'DepartmentHead'), async (req, res) => {
  const { assetId, employeeId, departmentId, expectedReturnDate } = req.body;

  // Validate: exactly one of employeeId or departmentId must be provided
  if ((employeeId && departmentId) || (!employeeId && !departmentId)) {
    return res.status(400).json({ error: 'You must specify exactly one holder: either employeeId or departmentId.' });
  }

  if (!assetId) {
    return res.status(400).json({ error: 'Asset ID is required.' });
  }

  try {
    // Check if asset exists
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // 1. Conflict Check: check if the asset is currently available
    // We execute the check-and-write atomically inside a prisma.$transaction
    // to prevent a race condition where two simultaneous allocation requests
    // read the status as 'Available' before either has updated it.
    const result = await prisma.$transaction(async (tx) => {
      // Re-query the asset inside the transaction with status verification
      const txAsset = await tx.asset.findUnique({
        where: { id: assetId },
        select: { status: true, tag: true, name: true }
      });

      if (txAsset.status !== 'Available') {
        // Find the active allocation causing the conflict
        const activeAlloc = await tx.allocation.findFirst({
          where: { assetId, status: 'Active' },
          include: {
            employee: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } }
          }
        });

        return {
          conflict: true,
          activeAlloc
        };
      }

      // Create allocation record
      const allocation = await tx.allocation.create({
        data: {
          assetId,
          employeeId: employeeId || null,
          departmentId: departmentId || null,
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          status: 'Active',
        }
      });

      // Update asset status
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'Allocated' }
      });

      return {
        conflict: false,
        allocation,
        assetTag: txAsset.tag,
        assetName: txAsset.name
      };
    });

    if (result.conflict) {
      const active = result.activeAlloc;
      const currentHolder = active
        ? (active.employee
            ? { id: active.employee.id, name: active.employee.name, type: 'Employee' }
            : { id: active.department.id, name: active.department.name, type: 'Department' })
        : { id: null, name: 'Unknown holder' };

      return res.status(409).json({
        error: 'Asset currently allocated',
        currentHolder,
        allocationId: active ? active.id : null,
        canRequestTransfer: true
      });
    }

    // Create Notification and ActivityLog outside transaction to avoid slowing locks
    const notifyUserId = employeeId || null;
    let deptHeadId = null;

    if (departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { headId: true }
      });
      deptHeadId = dept?.headId;
    }

    const recipientId = notifyUserId || deptHeadId;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'AssetAssigned',
          message: `Asset Assigned: ${result.assetTag} - ${result.assetName}`
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Allocated asset ${result.assetTag} (${result.assetName}) to ${employeeId ? 'employee' : 'department'} (${employeeId || departmentId})`,
        entityType: 'Asset',
        entityId: assetId
      }
    });

    return res.status(201).json(result.allocation);

  } catch (error) {
    console.error('[POST /api/allocations error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/allocations
// Scoped by role
router.get('/', authenticate, async (req, res) => {
  const { status, overdue } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true }
    });
    const userDeptId = user?.departmentId;

    let roleWhere = {};
    if (req.user.role === 'Employee') {
      // Employees see only their own allocations
      roleWhere = { employeeId: req.user.id };
    } else if (req.user.role === 'DepartmentHead') {
      // Department heads see allocations to their department OR employees in their department
      if (!userDeptId) {
        roleWhere = { employeeId: req.user.id };
      } else {
        roleWhere = {
          OR: [
            { departmentId: userDeptId },
            { employee: { departmentId: userDeptId } }
          ]
        };
      }
    } else {
      // Admins and AssetManagers see all allocations
      roleWhere = {};
    }

    const queryWhere = { AND: [roleWhere] };

    if (status) {
      queryWhere.AND.push({ status });
    }

    if (overdue === 'true') {
      queryWhere.AND.push({
        status: 'Active',
        expectedReturnDate: {
          lt: new Date()
        }
      });
    }

    const allocations = await prisma.allocation.findMany({
      where: queryWhere,
      include: {
        asset: {
          select: {
            id: true,
            tag: true,
            name: true,
            status: true,
            category: { select: { name: true } }
          }
        },
        employee: {
          select: { id: true, name: true, email: true }
        },
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        allocatedAt: 'desc'
      }
    });

    res.json(allocations);

  } catch (error) {
    console.error('[GET /api/allocations error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/allocations/:id/return
// Restricted to Admin and AssetManager
router.patch('/:id/return', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;
  const { conditionNotes } = req.body;

  try {
    const allocation = await prisma.allocation.findUnique({
      where: { id },
      include: {
        asset: { select: { tag: true, name: true } }
      }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation record not found.' });
    }

    if (allocation.status !== 'Active') {
      return res.status(400).json({ error: 'This asset has already been returned.' });
    }

    // Atomic transaction: mark allocation as returned and flip asset status back to Available
    await prisma.$transaction(async (tx) => {
      await tx.allocation.update({
        where: { id },
        data: {
          returnedAt: new Date(),
          status: 'Returned',
          returnConditionNotes: conditionNotes ? conditionNotes.trim() : null
        }
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'Available' }
      });
    });

    // Notify user of return confirmation
    const recipientId = allocation.employeeId;
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'AssetReturned',
          message: `Asset return completed and verified for: ${allocation.asset.tag}`
        }
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Marked asset ${allocation.asset.tag} as returned. Condition notes: ${conditionNotes || 'None'}`,
        entityType: 'Asset',
        entityId: allocation.assetId
      }
    });

    res.json({ message: 'Asset return recorded successfully.' });

  } catch (error) {
    console.error('[PATCH /api/allocations/:id/return error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/transfers
// Anyone authenticated can request a transfer for an asset they don't hold
router.post('/', authenticate, async (req, res) => {
  const { allocationId } = req.body;
  const requestedById = req.user.id;

  if (!allocationId) {
    return res.status(400).json({ error: 'Allocation ID is required.' });
  }

  try {
    // Validate allocation exists and is Active
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: {
        asset: { select: { tag: true, name: true } },
        employee: { select: { id: true, name: true, departmentId: true } },
        department: { select: { id: true, headId: true } }
      }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found.' });
    }

    if (allocation.status !== 'Active') {
      return res.status(400).json({ error: 'Cannot request a transfer for an inactive allocation.' });
    }

    // Check if the user already holds the asset
    if (allocation.employeeId === requestedById) {
      return res.status(400).json({ error: 'You are already the allocated holder of this asset.' });
    }

    // Create Transfer record
    const transfer = await prisma.transfer.create({
      data: {
        allocationId,
        requestedById,
        status: 'Requested',
      },
      include: {
        requestedBy: { select: { name: true } }
      }
    });

    // Notify current holder
    const holderId = allocation.employeeId || allocation.department?.headId;
    if (holderId) {
      await prisma.notification.create({
        data: {
          userId: holderId,
          type: 'TransferRequested',
          message: `Transfer requested for your allocated asset: ${allocation.asset.tag}. Requested by: ${transfer.requestedBy.name}`
        }
      });
    }

    // Notify approver: Department Head of the holder's department OR Asset Manager
    // In this implementation we find the department head to notify
    const deptId = allocation.employee?.departmentId || allocation.departmentId;
    if (deptId) {
      const dept = await prisma.department.findUnique({
        where: { id: deptId },
        select: { headId: true }
      });
      if (dept?.headId && dept.headId !== holderId) {
        await prisma.notification.create({
          data: {
            userId: dept.headId,
            type: 'TransferRequested',
            message: `A transfer request is pending approval for asset ${allocation.asset.tag} within your department.`
          }
        });
      }
    }

    res.status(201).json(transfer);

  } catch (error) {
    console.error('[POST /api/transfers error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transfers
// Scoped by role
router.get('/', authenticate, async (req, res) => {
  try {
    let roleWhere = {};

    if (req.user.role !== 'Admin' && req.user.role !== 'AssetManager') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { departmentId: true }
      });
      const userDeptId = user?.departmentId;

      roleWhere = {
        OR: [
          { requestedById: req.user.id },
          {
            allocation: {
              OR: [
                { employeeId: req.user.id },
                { departmentId: userDeptId },
                { employee: { departmentId: userDeptId } }
              ]
            }
          },
          ...(userDeptId ? [{ requestedBy: { departmentId: userDeptId } }] : [])
        ]
      };
    }

    const transfers = await prisma.transfer.findMany({
      where: roleWhere,
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true }
        },
        approvedBy: {
          select: { id: true, name: true }
        },
        allocation: {
          include: {
            asset: {
              select: { id: true, tag: true, name: true, status: true }
            },
            employee: {
              select: { id: true, name: true, email: true }
            },
            department: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(transfers);

  } catch (error) {
    console.error('[GET /api/transfers error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/transfers/:id/approve
// Restricted to Admin, AssetManager, DepartmentHead
router.patch('/:id/approve', authenticate, authorize('Admin', 'AssetManager', 'DepartmentHead'), async (req, res) => {
  const { id } = req.params;

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, name: true } },
        allocation: {
          include: {
            asset: { select: { id: true, tag: true, name: true } },
            employee: { select: { id: true, name: true } },
            department: { select: { id: true, headId: true } }
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found.' });
    }

    if (transfer.status !== 'Requested') {
      return res.status(400).json({ error: `Cannot approve a transfer with status: ${transfer.status}` });
    }

    // Verify target allocation is still Active
    if (transfer.allocation.status !== 'Active') {
      return res.status(400).json({ error: 'The source allocation is no longer active.' });
    }

    // Atomic Transaction: Approve transfer, return old allocation, create new allocation
    await prisma.$transaction(async (tx) => {
      // 1. Update transfer status
      await tx.transfer.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedById: req.user.id
        }
      });

      // 2. Terminate the old allocation
      await tx.allocation.update({
        where: { id: transfer.allocationId },
        data: {
          returnedAt: new Date(),
          status: 'Returned'
        }
      });

      // 3. Create a new allocation for the transfer requester
      // NOTE: The asset status never flips to Available during a transfer.
      // It stays 'Allocated' throughout because it is directly reallocated.
      await tx.allocation.create({
        data: {
          assetId: transfer.allocation.assetId,
          employeeId: transfer.requestedById,
          status: 'Active',
          allocatedAt: new Date()
        }
      });
    });

    // Notify old holder
    const oldHolderId = transfer.allocation.employeeId || transfer.allocation.department?.headId;
    if (oldHolderId) {
      await prisma.notification.create({
        data: {
          userId: oldHolderId,
          type: 'TransferApproved',
          message: `Your asset ${transfer.allocation.asset.tag} has been transferred to ${transfer.requestedBy.name}.`
        }
      });
    }

    // Notify new holder (requester)
    await prisma.notification.create({
      data: {
        userId: transfer.requestedById,
        type: 'TransferApproved',
        message: `Your transfer request for asset ${transfer.allocation.asset.tag} was approved. It is now allocated to you.`
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `Approved transfer of asset ${transfer.allocation.asset.tag} to ${transfer.requestedBy.name}`,
        entityType: 'Asset',
        entityId: transfer.allocation.assetId
      }
    });

    res.json({ message: 'Transfer request approved and reallocated.' });

  } catch (error) {
    console.error('[PATCH /api/transfers/:id/approve error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/transfers/:id/reject
// Restricted to Admin, AssetManager, DepartmentHead
router.patch('/:id/reject', authenticate, authorize('Admin', 'AssetManager', 'DepartmentHead'), async (req, res) => {
  const { id } = req.params;

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        allocation: {
          include: {
            asset: { select: { tag: true } }
          }
        }
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found.' });
    }

    if (transfer.status !== 'Requested') {
      return res.status(400).json({ error: `Cannot reject a transfer with status: ${transfer.status}` });
    }

    await prisma.transfer.update({
      where: { id },
      data: {
        status: 'Rejected',
        approvedById: req.user.id
      }
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: transfer.requestedById,
        type: 'TransferRejected',
        message: `Your transfer request for asset ${transfer.allocation.asset.tag} was rejected.`
      }
    });

    res.json({ message: 'Transfer request rejected successfully.' });

  } catch (error) {
    console.error('[PATCH /api/transfers/:id/reject error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

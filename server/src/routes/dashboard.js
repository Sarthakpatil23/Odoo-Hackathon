const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── KPI METRICS ─────────────────────────────────────────────────────────────

// GET /api/dashboard/kpis
router.get('/dashboard/kpis', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true }
    });
    const userDeptId = user?.departmentId;
    const isManager = req.user.role === 'Admin' || req.user.role === 'AssetManager';
    const isDeptHead = req.user.role === 'DepartmentHead';

    // A. Available Assets Count (available org-wide in storage)
    const availableCount = await prisma.asset.count({
      where: { status: 'Available' }
    });

    // B. Allocated Assets Count (role-scoped)
    let allocWhere = { status: 'Active' };
    if (!isManager) {
      if (isDeptHead && userDeptId) {
        allocWhere.OR = [
          { departmentId: userDeptId },
          { employee: { departmentId: userDeptId } }
        ];
      } else {
        allocWhere.employeeId = req.user.id;
      }
    }
    const allocatedCount = await prisma.allocation.count({ where: allocWhere });

    // C. Maintenance Today (role-scoped)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let maintWhere = {
      status: { in: ['Approved', 'TechnicianAssigned', 'InProgress'] },
      updatedAt: { gte: startOfToday }
    };
    if (!isManager) {
      if (isDeptHead && userDeptId) {
        maintWhere.raisedBy = { departmentId: userDeptId };
      } else {
        maintWhere.raisedById = req.user.id;
      }
    }
    const maintenanceTodayCount = await prisma.maintenanceRequest.count({ where: maintWhere });

    // D. Active Bookings (role-scoped)
    let bookWhere = { status: { in: ['Upcoming', 'Ongoing'] } };
    if (!isManager) {
      if (isDeptHead && userDeptId) {
        bookWhere.employee = { departmentId: userDeptId };
      } else {
        bookWhere.employeeId = req.user.id;
      }
    }
    const activeBookingsCount = await prisma.booking.count({ where: bookWhere });

    // E. Pending Transfers (role-scoped)
    let transWhere = { status: 'Requested' };
    if (!isManager) {
      if (isDeptHead && userDeptId) {
        transWhere.allocation = {
          OR: [
            { departmentId: userDeptId },
            { employee: { departmentId: userDeptId } }
          ]
        };
      } else {
        transWhere.OR = [
          { requestedById: req.user.id },
          { allocation: { employeeId: req.user.id } }
        ];
      }
    }
    const pendingTransfersCount = await prisma.transfer.count({ where: transWhere });

    // F. Upcoming Returns (expectedReturnDate in next 7 days, status Active)
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    let upcomingWhere = {
      status: 'Active',
      expectedReturnDate: {
        gte: now,
        lte: next7Days
      }
    };
    if (!isManager) {
      if (isDeptHead && userDeptId) {
        upcomingWhere.OR = [
          { departmentId: userDeptId },
          { employee: { departmentId: userDeptId } }
        ];
      } else {
        upcomingWhere.employeeId = req.user.id;
      }
    }
    const upcomingReturnsCount = await prisma.allocation.count({ where: upcomingWhere });

    res.json({
      available: availableCount,
      allocated: allocatedCount,
      maintenanceToday: maintenanceTodayCount,
      activeBookings: activeBookingsCount,
      pendingTransfers: pendingTransfersCount,
      upcomingReturns: upcomingReturnsCount
    });

  } catch (error) {
    console.error('[GET /api/dashboard/kpis error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/overdue-returns
router.get('/dashboard/overdue-returns', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true }
    });
    const userDeptId = user?.departmentId;
    const isManager = req.user.role === 'Admin' || req.user.role === 'AssetManager';
    const isDeptHead = req.user.role === 'DepartmentHead';

    const now = new Date();

    let overdueWhere = {
      status: 'Active',
      expectedReturnDate: { lt: now }
    };

    if (!isManager) {
      if (isDeptHead && userDeptId) {
        overdueWhere.OR = [
          { departmentId: userDeptId },
          { employee: { departmentId: userDeptId } }
        ];
      } else {
        overdueWhere.employeeId = req.user.id;
      }
    }

    const allocations = await prisma.allocation.findMany({
      where: overdueWhere,
      include: {
        asset: { select: { tag: true, name: true } },
        employee: { select: { name: true, email: true } },
        department: { select: { name: true } }
      },
      orderBy: {
        expectedReturnDate: 'asc'
      }
    });

    const formatted = allocations.map(a => ({
      id: a.id,
      assetTag: a.asset.tag,
      assetName: a.asset.name,
      holderName: a.employee ? a.employee.name : (a.department ? a.department.name : 'Unknown'),
      expectedReturnDate: a.expectedReturnDate
    }));

    res.json(formatted);

  } catch (error) {
    console.error('[GET /api/dashboard/overdue-returns error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── USER NOTIFICATIONS ──────────────────────────────────────────────────────

// GET /api/notifications
router.get('/notifications', authenticate, async (req, res) => {
  const { unread } = req.query;

  try {
    const where = { userId: req.user.id };
    if (unread === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('[GET /api/notifications error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    if (notif.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('[PATCH /api/notifications/:id/read error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/notifications/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[PATCH /api/notifications/read-all error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── ANALYTICS REPORTS ────────────────────────────────────────────────────────

// GET /api/reports/asset-status-breakdown
router.get('/reports/asset-status-breakdown', authenticate, async (req, res) => {
  try {
    const breakDown = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const formatted = breakDown.map(item => ({
      name: item.status,
      value: item._count.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[GET /api/reports/asset-status-breakdown error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/maintenance-by-category
router.get('/reports/maintenance-by-category', authenticate, async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: {
          include: { category: { select: { name: true } } }
        }
      }
    });

    const categoryCounts = {};
    for (const req of requests) {
      const catName = req.asset?.category?.name || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }

    const formatted = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[GET /api/reports/maintenance-by-category error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

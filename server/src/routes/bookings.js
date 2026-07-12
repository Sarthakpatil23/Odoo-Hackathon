const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/bookings
// Any authenticated role can book a resource
router.post('/', authenticate, async (req, res) => {
  const { assetId, startTime, endTime } = req.body;
  const employeeId = req.user.id;

  if (!assetId || !startTime || !endTime) {
    return res.status(400).json({ error: 'assetId, startTime, and endTime are required.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return res.status(400).json({ error: 'endTime must be strictly after startTime.' });
  }

  try {
    // Validate asset exists and isBookable is true
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    if (!asset.isBookable) {
      return res.status(400).json({ error: 'This asset is not configured as a bookable resource.' });
    }

    // We execute the overlap check and insertion inside a prisma.$transaction
    // to prevent a race condition where two users attempt to book overlapping
    // slots at the exact same time.
    const result = await prisma.$transaction(async (tx) => {
      // Overlap condition: existingStart < newEnd AND existingEnd > newStart
      const conflict = await tx.booking.findFirst({
        where: {
          assetId,
          status: { in: ['Upcoming', 'Ongoing'] },
          startTime: { lt: end },
          endTime: { gt: start }
        },
        include: {
          employee: { select: { name: true } }
        }
      });

      if (conflict) {
        return {
          hasOverlap: true,
          conflictingBooking: conflict
        };
      }

      // Create Booking record
      const newBooking = await tx.booking.create({
        data: {
          assetId,
          employeeId,
          startTime: start,
          endTime: end,
          status: 'Upcoming',
        }
      });

      return {
        hasOverlap: false,
        booking: newBooking
      };
    });

    if (result.hasOverlap) {
      const conf = result.conflictingBooking;
      return res.status(409).json({
        error: 'Time slot overlaps with an existing booking',
        conflictingBooking: {
          startTime: conf.startTime,
          endTime: conf.endTime,
          bookerName: conf.employee ? conf.employee.name : 'Another user'
        }
      });
    }

    // Notify requester of confirmation
    await prisma.notification.create({
      data: {
        userId: employeeId,
        type: 'BookingConfirmed',
        message: `Booking Confirmed: ${asset.tag} (${asset.name}) for ${start.toLocaleString()} - ${end.toLocaleString()}`
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: employeeId,
        action: `Booked resource ${asset.tag} for slot ${start.toISOString()} to ${end.toISOString()}`,
        entityType: 'Booking',
        entityId: result.booking.id
      }
    });

    res.status(201).json(result.booking);

  } catch (error) {
    console.error('[POST /api/bookings error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings
// Supports calendar lookups (?assetId=) and role-scoped lists
router.get('/', authenticate, async (req, res) => {
  const { assetId } = req.query;

  try {
    if (assetId) {
      // Calendar view: returns all non-cancelled bookings for this asset so conflicts are clear
      const bookings = await prisma.booking.findMany({
        where: {
          assetId,
          status: { in: ['Upcoming', 'Ongoing', 'Completed'] }
        },
        include: {
          employee: { select: { name: true, email: true } },
          asset: { select: { name: true, tag: true } }
        },
        orderBy: {
          startTime: 'asc'
        }
      });
      return res.json(bookings);
    }

    // Otherwise, return role-scoped list
    let roleWhere = {};
    if (req.user.role === 'Employee') {
      roleWhere = { employeeId: req.user.id };
    } else if (req.user.role === 'DepartmentHead') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { departmentId: true }
      });
      const userDeptId = user?.departmentId;

      if (!userDeptId) {
        roleWhere = { employeeId: req.user.id };
      } else {
        roleWhere = {
          employee: {
            departmentId: userDeptId
          }
        };
      }
    } else {
      // Admin and AssetManager see all bookings
      roleWhere = {};
    }

    const bookings = await prisma.booking.findMany({
      where: roleWhere,
      include: {
        asset: {
          select: { id: true, tag: true, name: true, status: true, category: { select: { name: true } } }
        },
        employee: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    res.json(bookings);

  } catch (error) {
    console.error('[GET /api/bookings error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/bookings/:id/cancel
// Allowed for requester or Admin/AssetManager
router.patch('/:id/cancel', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Permission check: only creator or Admin/AssetManager can cancel
    const isCreator = booking.employeeId === userId;
    const isAuthorized = isCreator || role === 'Admin' || role === 'AssetManager';

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
    }

    // Only allowed if status is currently Upcoming
    if (booking.status !== 'Upcoming') {
      return res.status(400).json({ error: `Cannot cancel booking with current status: ${booking.status}` });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'Cancelled' },
      include: {
        asset: { select: { tag: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: `Cancelled booking for resource ${updated.asset.tag}`,
        entityType: 'Booking',
        entityId: id
      }
    });

    res.json({ message: 'Booking cancelled successfully.', booking: updated });

  } catch (error) {
    console.error('[PATCH /api/bookings/:id/cancel error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

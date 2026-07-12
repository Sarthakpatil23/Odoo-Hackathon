const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to check circular dependency in department hierarchy
// Returns true if circular dependency detected
async function checkCircularDependency(deptId, targetParentId) {
  if (!targetParentId) return false;
  if (deptId === targetParentId) return true;

  let currentParentId = targetParentId;
  let iterations = 0;
  // Safety cutoff to prevent infinite loops
  while (currentParentId && iterations < 100) {
    iterations++;
    const parentDept = await prisma.department.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    });
    if (!parentDept) break;
    if (parentDept.parentId === deptId) {
      return true;
    }
    currentParentId = parentDept.parentId;
  }
  return false;
}

// GET /api/departments
// Admin role required
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  const { status } = req.query;

  try {
    const where = {};
    if (status) {
      where.status = status;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        head: {
          select: {
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(departments);
  } catch (error) {
    console.error('[GET /api/departments error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/departments
// Admin role required
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  const { name, headId, parentId, status } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Department name is required' });
  }

  try {
    // Validate headId if provided
    if (headId) {
      const userExists = await prisma.user.findUnique({ where: { id: headId } });
      if (!userExists) {
        return res.status(400).json({ error: 'Selected Head user does not exist' });
      }
    }

    // Validate parentId if provided
    if (parentId) {
      const parentExists = await prisma.department.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return res.status(400).json({ error: 'Selected Parent department does not exist' });
      }
    }

    const newDept = await prisma.department.create({
      data: {
        name: name.trim(),
        headId: headId || null,
        parentId: parentId || null,
        status: status === 'Inactive' ? 'Inactive' : 'Active',
      },
      include: {
        head: {
          select: {
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(201).json(newDept);
  } catch (error) {
    console.error('[POST /api/departments error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/departments/:id
// Admin role required
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;
  const { name, headId, parentId, status } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Department name is required' });
  }

  try {
    // Verify department exists
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if target parent is itself
    if (parentId === id) {
      return res.status(400).json({ error: 'A department cannot be its own parent' });
    }

    // Validate headId if provided
    if (headId) {
      const userExists = await prisma.user.findUnique({ where: { id: headId } });
      if (!userExists) {
        return res.status(400).json({ error: 'Selected Head user does not exist' });
      }
    }

    // Validate parentId and check circular reference
    if (parentId) {
      const parentExists = await prisma.department.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return res.status(400).json({ error: 'Selected Parent department does not exist' });
      }

      const isCircular = await checkCircularDependency(id, parentId);
      if (isCircular) {
        return res.status(400).json({ error: 'Circular dependency detected in department hierarchy' });
      }
    }

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        name: name.trim(),
        headId: headId || null,
        parentId: parentId || null,
        status: status === 'Inactive' ? 'Inactive' : 'Active',
      },
      include: {
        head: {
          select: {
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(updatedDept);
  } catch (error) {
    console.error('[PUT /api/departments/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/departments/:id/deactivate
// Admin role required
router.patch('/:id/deactivate', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        status: 'Inactive',
      },
      include: {
        head: {
          select: {
            name: true,
            email: true,
          },
        },
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({ message: 'Department deactivated successfully', department: updatedDept });
  } catch (error) {
    console.error('[PATCH /api/departments/:id/deactivate error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

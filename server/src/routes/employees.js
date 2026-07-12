const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/employees
// Admin and AssetManager role required
router.get('/', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { role, status, search } = req.query;

  try {
    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      where.OR = [
        { name: { contains: searchTrimmed, mode: 'insensitive' } },
        { email: { contains: searchTrimmed, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Formatting output to match requested frontend fields
    const formatted = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      department: emp.department ? emp.department.name : null,
      departmentId: emp.departmentId,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[GET /api/employees error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/employees/:id/status
// Admin role required
router.patch('/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'Active' && status !== 'Inactive')) {
    return res.status(400).json({ error: 'Status must be either Active or Inactive' });
  }

  // Prevent admin from deactivating their own account
  if (req.user.id === id && status === 'Inactive') {
    return res.status(400).json({ error: "Deactivation blocked: You cannot deactivate your own administrator account." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('[PATCH /api/employees/:id/status error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/employees/:id/department
// Admin role required
router.patch('/:id/department', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;
  const { departmentId } = req.body; // Can be null/empty to unassign

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate department exists if provided
    if (departmentId) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        return res.status(400).json({ error: 'Department does not exist' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      department: updatedUser.department ? updatedUser.department.name : null,
    });
  } catch (error) {
    console.error('[PATCH /api/employees/:id/department error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/employees/:id/promote
// Admin role required
router.patch('/:id/promote', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['DepartmentHead', 'AssetManager', 'Employee'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be one of: DepartmentHead, AssetManager, Employee' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Do not allow promoting/demoting Admin role through this endpoint
    if (user.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot change the role of an Administrator' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      department: updatedUser.department ? updatedUser.department.name : null,
    });
  } catch (error) {
    console.error('[PATCH /api/employees/:id/promote error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

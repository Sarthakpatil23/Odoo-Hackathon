const express = require('express');
const { PrismaClient } = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/assets
// Restricted to Admin and AssetManager roles
router.post('/', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const {
    name,
    categoryId,
    serialNumber,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    isBookable,
    photoUrl,
  } = req.body;

  if (!name || !categoryId || !acquisitionDate || acquisitionCost === undefined || !condition || !location) {
    return res.status(400).json({ error: 'Missing required asset fields.' });
  }

  try {
    // Validate category exists
    const category = await prisma.assetCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Selected asset category does not exist.' });
    }

    // Auto-generate tag: AF-XXXX zero padded
    const count = await prisma.asset.count();
    const tagNum = count + 1;
    const tag = `AF-${String(tagNum).padStart(4, '0')}`;

    const newAsset = await prisma.asset.create({
      data: {
        tag,
        name: name.trim(),
        categoryId,
        serialNumber: serialNumber ? serialNumber.trim() : null,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: Number(acquisitionCost),
        condition: condition.trim(),
        location: location.trim(),
        isBookable: !!isBookable,
        // photoUrl and documentUrl can be stored as a string or null
        // we'll assume a string photoUrl is supplied as requested
        status: 'Available', // defaults to Available
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    res.status(201).json(newAsset);
  } catch (error) {
    console.error('[POST /api/assets error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets
// Accessible to all authenticated users but results are role-scoped
router.get('/', authenticate, async (req, res) => {
  const { status, categoryId, departmentId, search, bookable } = req.query;

  try {
    // 1. Fetch user department details if role-scoping requires it
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true },
    });
    const userDeptId = user?.departmentId;

    // 2. Build role-based scoping filters
    let roleWhere = {};
    if (req.user.role === 'Employee') {
      // Employees see assets currently allocated to them OR bookable assets
      roleWhere = {
        OR: [
          {
            allocations: {
              some: {
                status: 'Active',
                employeeId: req.user.id,
              },
            },
          },
          { isBookable: true },
        ],
      };
    } else if (req.user.role === 'DepartmentHead') {
      // Department Heads see assets currently allocated to their department OR unallocated bookable assets
      if (!userDeptId) {
        roleWhere = { isBookable: true };
      } else {
        roleWhere = {
          OR: [
            // Allocated directly to the department
            {
              allocations: {
                some: {
                  status: 'Active',
                  departmentId: userDeptId,
                },
              },
            },
            // Allocated to an employee within their department
            {
              allocations: {
                some: {
                  status: 'Active',
                  employee: {
                    departmentId: userDeptId,
                  },
                },
              },
            },
            // Unallocated bookable assets
            {
              isBookable: true,
              allocations: {
                none: { status: 'Active' },
              },
            },
          ],
        };
      }
    } else {
      // Admin and AssetManager see all assets
      roleWhere = {};
    }

    // 3. Combine with query parameters
    const queryWhere = { AND: [roleWhere] };

    if (status) {
      queryWhere.AND.push({ status });
    }
    if (categoryId) {
      queryWhere.AND.push({ categoryId });
    }
    if (bookable === 'true') {
      queryWhere.AND.push({ isBookable: true });
    }
    if (departmentId) {
      // Filter by departmentId via current active allocation
      queryWhere.AND.push({
        allocations: {
          some: {
            status: 'Active',
            OR: [
              { departmentId },
              { employee: { departmentId } },
            ],
          },
        },
      });
    }
    if (search && search.trim() !== '') {
      const searchTrim = search.trim();
      queryWhere.AND.push({
        OR: [
          { tag: { contains: searchTrim, mode: 'insensitive' } },
          { name: { contains: searchTrim, mode: 'insensitive' } },
          { serialNumber: { contains: searchTrim, mode: 'insensitive' } },
        ],
      });
    }

    const assets = await prisma.asset.findMany({
      where: queryWhere,
      include: {
        category: {
          select: { name: true },
        },
        allocations: {
          where: { status: 'Active' },
          include: {
            employee: { select: { name: true, departmentId: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: {
        tag: 'asc',
      },
    });

    // Formatting return elements
    const formatted = assets.map((asset) => {
      const activeAlloc = asset.allocations[0] || null;
      let holderName = null;
      let allocatedDeptId = null;

      if (activeAlloc) {
        if (activeAlloc.employee) {
          holderName = activeAlloc.employee.name;
          allocatedDeptId = activeAlloc.employee.departmentId;
        } else if (activeAlloc.department) {
          holderName = activeAlloc.department.name;
          allocatedDeptId = activeAlloc.departmentId;
        }
      }

      return {
        id: asset.id,
        tag: asset.tag,
        name: asset.name,
        categoryId: asset.categoryId,
        categoryName: asset.category ? asset.category.name : null,
        serialNumber: asset.serialNumber,
        acquisitionDate: asset.acquisitionDate,
        acquisitionCost: asset.acquisitionCost,
        condition: asset.condition,
        location: asset.location,
        status: asset.status,
        isBookable: asset.isBookable,
        currentHolder: holderName,
        currentDepartmentId: allocatedDeptId,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('[GET /api/assets error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets/:id
// Full details, accessible to authorized roles if they own/can view the asset
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true },
        },
        allocations: {
          orderBy: { allocatedAt: 'desc' },
          include: {
            employee: {
              select: { name: true, email: true, departmentId: true },
            },
            department: {
              select: { name: true },
            },
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            raisedBy: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Role-scoped access validation
    const activeAlloc = asset.allocations.find(a => a.status === 'Active');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true },
    });
    const userDeptId = user?.departmentId;

    if (req.user.role === 'Employee') {
      // Employees can only fetch if allocated to them OR it's bookable
      const isAllocatedToSelf = activeAlloc && activeAlloc.employeeId === req.user.id;
      if (!isAllocatedToSelf && !asset.isBookable) {
        return res.status(403).json({ error: 'Access denied to this asset.' });
      }
    } else if (req.user.role === 'DepartmentHead') {
      // Department Heads can only fetch if allocated to their department OR unallocated bookable asset
      const isAllocatedToDept =
        activeAlloc &&
        (activeAlloc.departmentId === userDeptId ||
          (activeAlloc.employee && activeAlloc.employee.departmentId === userDeptId));
      const isUnallocatedBookable = asset.isBookable && !activeAlloc;

      if (!isAllocatedToDept && !isUnallocatedBookable) {
        return res.status(403).json({ error: 'Access denied to this asset.' });
      }
    }

    // Format Response
    const currentAllocation = activeAlloc
      ? {
          id: activeAlloc.id,
          allocatedAt: activeAlloc.allocatedAt,
          expectedReturnDate: activeAlloc.expectedReturnDate,
          holderName: activeAlloc.employee
            ? activeAlloc.employee.name
            : activeAlloc.department
            ? activeAlloc.department.name
            : 'Unknown',
          holderType: activeAlloc.employee ? 'Employee' : 'Department',
        }
      : null;

    const allocationHistory = asset.allocations.map((a) => ({
      id: a.id,
      allocatedAt: a.allocatedAt,
      returnedAt: a.returnedAt,
      status: a.status,
      holderName: a.employee
        ? a.employee.name
        : a.department
        ? a.department.name
        : 'Unknown',
      returnConditionNotes: a.returnConditionNotes,
    }));

    const maintenanceHistory = asset.maintenanceRequests.map((m) => ({
      id: m.id,
      issue: m.issue,
      priority: m.priority,
      status: m.status,
      createdAt: m.createdAt,
      raisedByName: m.raisedBy ? m.raisedBy.name : 'Unknown',
    }));

    res.json({
      id: asset.id,
      tag: asset.tag,
      name: asset.name,
      categoryId: asset.categoryId,
      categoryName: asset.category ? asset.category.name : null,
      serialNumber: asset.serialNumber,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      condition: asset.condition,
      location: asset.location,
      status: asset.status,
      isBookable: asset.isBookable,
      photoUrl: asset.photoUrl,
      currentAllocation,
      allocationHistory,
      maintenanceHistory,
    });
  } catch (error) {
    console.error('[GET /api/assets/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/assets/:id
// Restricted to Admin and AssetManager roles
router.put('/:id', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    categoryId,
    serialNumber,
    condition,
    location,
    isBookable,
    photoUrl,
  } = req.body;

  if (!name || !categoryId || !condition || !location) {
    return res.status(400).json({ error: 'Missing required asset fields.' });
  }

  try {
    const assetExists = await prisma.asset.findUnique({ where: { id } });
    if (!assetExists) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Validate category exists
    const category = await prisma.assetCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Selected asset category does not exist.' });
    }

    // CRITICAL: We do not allow updating 'status' here directly.
    // Asset status changes MUST only happen through explicit business logic workflows (e.g. Allocation, Maintenance, Audits).
    // Raw updates to status bypass integrity constraints.
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name: name.trim(),
        categoryId,
        serialNumber: serialNumber ? serialNumber.trim() : null,
        condition: condition.trim(),
        location: location.trim(),
        isBookable: !!isBookable,
        photoUrl: photoUrl ? photoUrl.trim() : null,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    res.json(updatedAsset);
  } catch (error) {
    console.error('[PUT /api/assets/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/assets/:id/retire
// Restricted to Admin and AssetManager
router.patch('/:id/retire', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: {
          where: { status: 'Active' },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Block if asset has active allocation
    if (asset.allocations.length > 0) {
      return res.status(409).json({
        error: 'Cannot retire an asset that is currently allocated — return it first.',
      });
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: 'Retired' },
    });

    res.json({ message: 'Asset successfully retired.', asset: updated });
  } catch (error) {
    console.error('[PATCH /api/assets/:id/retire error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/assets/:id/dispose
// Restricted to Admin and AssetManager
router.patch('/:id/dispose', authenticate, authorize('Admin', 'AssetManager'), async (req, res) => {
  const { id } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: {
          where: { status: 'Active' },
        },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Block if asset has active allocation
    if (asset.allocations.length > 0) {
      return res.status(409).json({
        error: 'Cannot dispose of an asset that is currently allocated — return it first.',
      });
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: 'Disposed' },
    });

    res.json({ message: 'Asset successfully disposed.', asset: updated });
  } catch (error) {
    console.error('[PATCH /api/assets/:id/dispose error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

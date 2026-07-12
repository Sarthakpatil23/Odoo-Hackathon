const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/asset-categories
// Admin role required
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('[GET /api/asset-categories error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/asset-categories
// Admin role required
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  const { name, fields } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const newCategory = await prisma.assetCategory.create({
      data: {
        name: name.trim(),
        fields: fields || null,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('[POST /api/asset-categories error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/asset-categories/:id
// Admin role required
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;
  const { name, fields } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const categoryExists = await prisma.assetCategory.findUnique({ where: { id } });
    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.assetCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        fields: fields !== undefined ? fields : categoryExists.fields,
      },
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error('[PUT /api/asset-categories/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/asset-categories/:id
// Admin role required
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.assetCategory.findUnique({
      where: { id },
      include: {
        assets: {
          take: 1, // Only need to verify if at least one asset references this category
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.assets.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete category: one or more assets currently reference this category.',
      });
    }

    await prisma.assetCategory.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/asset-categories/:id error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// routes/cat.routes.js
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all cats for user (USR-005)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, includeArchived } = req.query;
    
    const cats = await prisma.cat.findMany({
      where: {
        userId: req.user.id,
        ...(includeArchived !== 'true' && { isArchived: false }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ cats });
  } catch (error) {
    console.error('Get cats error:', error);
    res.status(500).json({ error: 'Failed to fetch cats' });
  }
});

// Get single cat by ID (USR-007)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cat = await prisma.cat.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        healthEvents: {
          orderBy: { date: 'desc' }
        },
        litters: {
          orderBy: { date: 'desc' }
        },
        adoptionRecords: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!cat) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    res.json({ cat });
  } catch (error) {
    console.error('Get cat error:', error);
    res.status(500).json({ error: 'Failed to fetch cat' });
  }
});

// Create new cat (USR-004)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, breed, gender, birthdate, color, weight, photo, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Cat name is required' });
    }

    const cat = await prisma.cat.create({
      data: {
        userId: req.user.id,
        name,
        breed,
        gender,
        birthdate: birthdate ? new Date(birthdate) : null,
        color,
        weight: weight ? parseFloat(weight) : null,
        photo,
        notes
      }
    });

    res.status(201).json({
      message: 'Cat created successfully',
      cat
    });
  } catch (error) {
    console.error('Create cat error:', error);
    res.status(500).json({ error: 'Failed to create cat' });
  }
});

// Update cat (USR-009)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, breed, gender, birthdate, color, weight, photo, notes } = req.body;

    const cat = await prisma.cat.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: {
        ...(name && { name }),
        ...(breed !== undefined && { breed }),
        ...(gender && { gender }),
        ...(birthdate !== undefined && { birthdate: birthdate ? new Date(birthdate) : null }),
        ...(color !== undefined && { color }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(photo !== undefined && { photo }),
        ...(notes !== undefined && { notes }),
        lastUpdated: new Date()
      }
    });

    if (cat.count === 0) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    const updatedCat = await prisma.cat.findUnique({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Cat updated successfully',
      cat: updatedCat
    });
  } catch (error) {
    console.error('Update cat error:', error);
    res.status(500).json({ error: 'Failed to update cat' });
  }
});

// Archive cat (USR-011)
router.patch('/:id/archive', authenticate, async (req, res) => {
  try {
    const cat = await prisma.cat.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: {
        isArchived: true
      }
    });

    if (cat.count === 0) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    res.json({ message: 'Cat archived successfully' });
  } catch (error) {
    console.error('Archive cat error:', error);
    res.status(500).json({ error: 'Failed to archive cat' });
  }
});

// Restore archived cat
router.patch('/:id/restore', authenticate, async (req, res) => {
  try {
    const cat = await prisma.cat.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: {
        isArchived: false,
        lastUpdated: new Date()
      }
    });

    if (cat.count === 0) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    res.json({ message: 'Cat restored successfully' });
  } catch (error) {
    console.error('Restore cat error:', error);
    res.status(500).json({ error: 'Failed to restore cat' });
  }
});

// Delete cat
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const cat = await prisma.cat.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (cat.count === 0) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    res.json({ message: 'Cat deleted successfully' });
  } catch (error) {
    console.error('Delete cat error:', error);
    res.status(500).json({ error: 'Failed to delete cat' });
  }
});

module.exports = router;

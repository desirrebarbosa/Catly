
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createInventoryItem = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name, category, quantity, unit, threshold, catIds } = req.body;

    const newItem = await prisma.inventoryItem.create({
      data: {
        userId,
        name,
        category,
        quantity: Number(quantity),
        unit,
        threshold: threshold ? Number(threshold) : null,
        cats: catIds ? {
            connect: catIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
          cats: { select: { name: true, photoUrl: true } }
      }
    });

    res.status(201).json({ success: true, data: { item: newItem } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
};

export const getInventoryItems = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const items = await prisma.inventoryItem.findMany({
      where: { userId },
      include: {
        cats: { select: { id: true, name: true, photoUrl: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: { items } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
};

export const updateInventoryItem = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { name, category, quantity, unit, threshold, catIds } = req.body;
  
      const item = await prisma.inventoryItem.findFirst({ where: { id, userId } });
      if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  
      const updatedItem = await prisma.inventoryItem.update({
        where: { id },
        data: {
          name,
          category,
          quantity: quantity !== undefined ? Number(quantity) : undefined,
          unit,
          threshold: threshold !== undefined ? Number(threshold) : undefined,
          cats: catIds ? {
              set: catIds.map((cid: string) => ({ id: cid }))
          } : undefined
        },
        include: {
            cats: { select: { id: true, name: true, photoUrl: true } }
        }
      });
  
      res.json({ success: true, data: { item: updatedItem } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
};

export const deleteInventoryItem = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const item = await prisma.inventoryItem.findFirst({ where: { id, userId } });
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

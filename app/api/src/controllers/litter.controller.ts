
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createLitter = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { catId } = req.params; // Mother's ID
    const { dateOfBirth, kittenCount, fatherId, notes, kittenIds } = req.body;

    const cat = await prisma.cat.findFirst({ where: { id: catId, ownerId: userId } });
    if (!cat) return res.status(404).json({ success: false, error: 'Cat not found' });

    const newLitter = await prisma.litter.create({
      data: {
        motherId: catId,
        fatherId: fatherId || null,
        dateOfBirth: new Date(dateOfBirth),
        kittenCount: Number(kittenCount),
        notes,
        kittens: kittenIds ? {
            connect: kittenIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
          kittens: true,
          father: true
      }
    });

    res.status(201).json({ success: true, data: { litter: newLitter } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to record litter' });
  }
};

export const getLitters = async (req: any, res: any) => {
  try {
    const { catId } = req.params;
    const litters = await prisma.litter.findMany({
      where: { motherId: catId },
      include: { 
          father: true,
          kittens: true // Include actual kitten profiles
      },
      orderBy: { dateOfBirth: 'desc' }
    });
    res.json({ success: true, data: { litters } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch litters' });
  }
};

export const deleteLitter = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.litter.delete({ where: { id } });
    res.json({ success: true, message: 'Litter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createAdoption = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { catId } = req.params;
    const { date, type, adopterName, notes } = req.body;

    // Verify ownership
    const cat = await prisma.cat.findFirst({ where: { id: catId, ownerId: userId } });
    if (!cat) return res.status(404).json({ success: false, error: 'Cat not found' });

    const newRecord = await prisma.adoptionRecord.create({
      data: {
        catId,
        date: new Date(date),
        type,
        adopterName,
        notes
      }
    });

    res.status(201).json({ success: true, data: { adoption: newRecord } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create record' });
  }
};

export const getAdoptions = async (req: any, res: any) => {
  try {
    const { catId } = req.params;
    const records = await prisma.adoptionRecord.findMany({
      where: { catId },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: { adoptions: records } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch records' });
  }
};

export const deleteAdoption = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.adoptionRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

import { Request, Response } from 'express';
import { prisma } from '../config/db';

// --- Helper: Auto-Archive Logic ---
export const runAutoArchive = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await prisma.cat.updateMany({
      where: {
        updatedAt: { lt: oneYearAgo },
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });
    
    if (result.count > 0) {
      console.log(`🧹 Auto-Archived ${result.count} inactive cat profiles.`);
    }
  } catch (error) {
    console.error("Auto-Archive Error:", error);
  }
};

export const getCats = async (req: any, res: any) => {
  try {
    const cats = await prisma.cat.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: { cats } });
  } catch (error) {
    console.error("Get Cats Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch cats' });
  }
};

export const getCatById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const cat = await prisma.cat.findUnique({
      where: { id },
      include: {
        mother: true,
        father: true,
        childrenMother: true,
        childrenFather: true
      }
    });

    if (!cat) return res.status(404).json({ success: false, error: 'Cat not found' });

    res.json({ success: true, data: { cat } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching details' });
  }
};

export const createCat = async (req: any, res: any) => {
  try {
    const { 
        name, nickname, breed, gender, weight, birthDate, 
        color, eyeColor, features, isSpayed, 
        motherId, fatherId, photoUrl 
    } = req.body;
    
    const owner = await prisma.user.findFirst();
    if (!owner) {
        return res.status(400).json({ success: false, error: 'No user exists. Run seeds first.' });
    }

    const newCat = await prisma.cat.create({
      data: {
        ownerId: owner.id,
        name,
        nickname,
        breed,
        gender,
        weight: weight ? Number(weight) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        color,
        eyeColor,
        features,
        isSpayed,
        isArchived: false,
        motherId: motherId || null,
        fatherId: fatherId || null,
        photoUrl: photoUrl || (gender === 'Female' ? 'https://placekitten.com/200/200' : 'https://placekitten.com/201/201')
      }
    });
    
    res.status(201).json({ success: true, data: { cat: newCat } });
  } catch (error) {
    console.error("Create Cat Error:", error);
    res.status(400).json({ success: false, error: 'Failed to create cat' });
  }
};

export const updateCat = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { 
        name, nickname, breed, weight, birthDate, 
        color, eyeColor, features, isArchived, 
        motherId, fatherId, photoUrl 
    } = req.body;

    const updatedCat = await prisma.cat.update({
      where: { id },
      data: {
        name,
        nickname,
        breed,
        weight: weight !== undefined ? Number(weight) : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        color,
        eyeColor,
        features,
        isArchived,
        motherId: motherId || null,
        fatherId: fatherId || null,
        photoUrl: photoUrl || undefined // Only update if provided
      }
    });

    res.json({ success: true, data: { cat: updatedCat } });
  } catch (error) {
    console.error("Update Cat Error:", error);
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

export const deleteCat = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.healthEvent.deleteMany({ where: { catId: id } });
    await prisma.cat.delete({ where: { id } });
    res.json({ success: true, message: 'Cat deleted' });
  } catch (error) {
    console.error("Delete Cat Error:", error);
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

export const addHealthEvent = async (req: any, res: any) => {
  try {
    const { catId } = req.params;
    const { title, eventType, notes, diagnosis, date } = req.body;
    
    const newEvent = await prisma.healthEvent.create({
      data: {
        catId,
        title,
        eventType,
        notes,
        diagnosis,
        date: date ? new Date(date) : new Date(),
      }
    });
    
    await prisma.cat.update({
      where: { id: catId },
      data: { updatedAt: new Date() }
    });
    
    res.status(201).json({ success: true, data: { event: newEvent } });
  } catch (error) {
    console.error("Add Health Event Error:", error);
    res.status(500).json({ success: false, error: 'Failed to save event' });
  }
};

export const getHealthEvents = async (req: any, res: any) => {
  try {
    const { catId } = req.params;
    const events = await prisma.healthEvent.findMany({
      where: { catId },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: { events } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};
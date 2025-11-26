import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getCats = async (req: any, res: any) => {
  try {
    // In a real app, you would filter by ownerId: req.user.id
    // For this demo, we verify we have a user in the system to attribute cats to, 
    // or return all cats if no specific owner filter is applied yet.
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

    res.json({ 
      success: true, 
      data: { cat } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching details' });
  }
};

export const createCat = async (req: any, res: any) => {
  try {
    const { name, breed, gender, weight, isSpayed, motherId, fatherId } = req.body;
    
    // In a real app, use req.user.id
    const owner = await prisma.user.findFirst();
    if (!owner) {
        return res.status(400).json({ success: false, error: 'No user exists to own this cat. Run seeds first.' });
    }

    const newCat = await prisma.cat.create({
      data: {
        ownerId: owner.id,
        name,
        breed,
        gender,
        weight: parseFloat(weight),
        isSpayed,
        isArchived: false,
        motherId: motherId || null,
        fatherId: fatherId || null,
        photoUrl: gender === 'Female' ? 'https://placekitten.com/200/200' : 'https://placekitten.com/201/201' // Placeholder logic
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
    const { name, breed, weight, isArchived, motherId, fatherId } = req.body;

    const updatedCat = await prisma.cat.update({
      where: { id },
      data: {
        name,
        breed,
        weight: weight ? parseFloat(weight) : undefined,
        isArchived,
        motherId: motherId || null,
        fatherId: fatherId || null
      }
    });

    res.json({ success: true, data: { cat: updatedCat } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

export const deleteCat = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Delete health events first due to foreign key constraints if cascading isn't set
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
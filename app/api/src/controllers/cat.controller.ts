
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

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
    const userId = req.userId;
    // Log for debugging
    console.log(`[API] Fetching cats for user: ${userId}`);
    
    // Strict isolation: only fetch cats owned by this user
    const cats = await prisma.cat.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[API] Found ${cats.length} cats for user ${userId}`);
    res.json({ success: true, data: { cats: cats || [] } });
  } catch (error) {
    console.error("Get Cats Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch cats' });
  }
};

export const getCatById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Strict isolation
    const cat = await prisma.cat.findFirst({
      where: { 
        id,
        ownerId: userId 
      },
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
    
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Determine photo URL
    let finalPhotoUrl = photoUrl;
    if (!finalPhotoUrl) {
        finalPhotoUrl = gender === 'Female' ? 'https://placekitten.com/200/200' : 'https://placekitten.com/201/201';
    }

    const newCat = await prisma.cat.create({
      data: {
        ownerId: userId, // Enforce ownership
        name,
        nickname,
        breed,
        gender,
        weight: weight ? Number(weight) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        color,
        eyeColor,
        features,
        isSpayed: !!isSpayed, // Ensure boolean
        isArchived: false, // EXPLICITLY set to false
        motherId: motherId || null,
        fatherId: fatherId || null,
        photoUrl: finalPhotoUrl
      }
    });
    
    console.log(`[API] Created new cat: ${newCat.name} (ID: ${newCat.id}) for user ${userId}`);
    res.status(201).json({ success: true, data: { cat: newCat } });
  } catch (error) {
    console.error("Create Cat Error:", error);
    res.status(400).json({ success: false, error: 'Failed to create cat' });
  }
};

export const updateCat = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { 
        name, nickname, breed, gender, weight, birthDate, 
        color, eyeColor, features, isSpayed, isArchived, 
        motherId, fatherId, photoUrl 
    } = req.body;

    // Check ownership before update
    const existingCat = await prisma.cat.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingCat) {
      return res.status(404).json({ success: false, error: 'Cat not found or unauthorized' });
    }

    const updatedCat = await prisma.cat.update({
      where: { id },
      data: {
        name,
        nickname,
        breed,
        gender,
        weight: weight !== undefined ? Number(weight) : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        color,
        eyeColor,
        features,
        isSpayed,
        isArchived,
        motherId: motherId || null,
        fatherId: fatherId || null,
        photoUrl: photoUrl || undefined
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
    const userId = req.userId;

    // Check ownership before delete
    const existingCat = await prisma.cat.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existingCat) {
      return res.status(404).json({ success: false, error: 'Cat not found or unauthorized' });
    }

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
    const userId = req.userId;
    const { title, eventType, notes, diagnosis, date } = req.body;
    
    // Check ownership
    const cat = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId }
    });

    if (!cat) {
      return res.status(404).json({ success: false, error: 'Cat not found or unauthorized' });
    }

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
    const userId = req.userId;

    // Check ownership
    const cat = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId }
    });

    if (!cat) {
      return res.status(404).json({ success: false, error: 'Cat not found or unauthorized' });
    }

    const events = await prisma.healthEvent.findMany({
      where: { catId },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: { events } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};

export const deleteHealthEvent = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Verify ownership via nested query
    const event = await prisma.healthEvent.findUnique({
      where: { id: eventId },
      include: { cat: true }
    });

    if (!event || event.cat.ownerId !== userId) {
        return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }

    await prisma.healthEvent.delete({ where: { id: eventId } });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

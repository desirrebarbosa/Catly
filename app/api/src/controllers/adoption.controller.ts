
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createAdoption = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { catId } = req.params;
    const { date, type, adopterName, adopterPhone, adopterEmail, notes, contactId } = req.body;

    // Verify ownership
    const cat = await prisma.cat.findFirst({ where: { id: catId, ownerId: userId } });
    if (!cat) return res.status(404).json({ success: false, error: 'Cat not found' });

    let finalContactId = contactId;
    let finalAdopterName = adopterName;

    // Logic: If no specific ID provided, check if contact exists by Name. If not, create one.
    if (!finalContactId && adopterName) {
        // 1. Try to find existing
        const existingContact = await prisma.contact.findFirst({
            where: {
                ownerId: userId,
                name: { equals: adopterName, mode: 'insensitive' }
            }
        });

        if (existingContact) {
            finalContactId = existingContact.id;
        } else {
            // 2. Create new contact
            console.log(`[Adoption] Creating new contact for ${adopterName}`);
            const newContact = await prisma.contact.create({
                data: {
                    ownerId: userId,
                    name: adopterName,
                    role: 'Adopter',
                    phone: adopterPhone || null,
                    email: adopterEmail || null
                }
            });
            finalContactId = newContact.id;
        }
    } else if (finalContactId) {
        // If ID provided via picker, ensure we have the name for the record snapshot
        const c = await prisma.contact.findUnique({ where: { id: finalContactId } });
        if(c) finalAdopterName = c.name;
    }

    const newRecord = await prisma.adoptionRecord.create({
      data: {
        catId,
        date: new Date(date),
        type,
        adopterName: finalAdopterName,
        contactId: finalContactId, // Link the contact
        notes
      }
    });

    res.status(201).json({ success: true, data: { adoption: newRecord } });
  } catch (error) {
    console.error("Create Adoption Error:", error);
    res.status(500).json({ success: false, error: 'Failed to create record' });
  }
};

export const getAdoptions = async (req: any, res: any) => {
  try {
    const { catId } = req.params;
    const records = await prisma.adoptionRecord.findMany({
      where: { catId },
      include: {
        contact: true // Include contact details
      },
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

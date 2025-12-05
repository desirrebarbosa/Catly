
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createContact = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name, role, phone, email } = req.body;

    const newContact = await prisma.contact.create({
      data: {
        ownerId: userId,
        name,
        role,
        phone,
        email
      }
    });

    res.status(201).json({ success: true, data: { contact: newContact } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
};

export const getContacts = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      include: {
        adoptions: {
            select: {
                cat: {
                    select: { name: true }
                }
            }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: { contacts } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
};

export const updateContact = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { name, role, phone, email } = req.body;
  
      const contact = await prisma.contact.findFirst({ where: { id, ownerId: userId } });
      if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
  
      const updatedContact = await prisma.contact.update({
        where: { id },
        data: {
          name,
          role,
          phone,
          email
        }
      });
  
      res.json({ success: true, data: { contact: updatedContact } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
};

export const deleteContact = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const contact = await prisma.contact.findFirst({ where: { id, ownerId: userId } });
    if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });

    await prisma.contact.delete({ where: { id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

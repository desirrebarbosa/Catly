
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createSchedule = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { catId, taskName, time, recurrence } = req.body;

    if (!catId) return res.status(400).json({ success: false, error: 'Cat is required for schedule' });

    // Verify ownership of cat
    const cat = await prisma.cat.findFirst({ where: { id: catId, ownerId: userId } });
    if (!cat) return res.status(404).json({ success: false, error: 'Cat not found or unauthorized' });

    const newSchedule = await prisma.schedule.create({
      data: {
        userId,
        catId,
        taskName,
        time,
        recurrence
      }
    });

    res.status(201).json({ success: true, data: { schedule: newSchedule } });
  } catch (error) {
    console.error("Create Schedule Error:", error);
    res.status(500).json({ success: false, error: 'Failed to create schedule' });
  }
};

export const getSchedules = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const schedules = await prisma.schedule.findMany({
      where: { userId },
      include: {
        cat: {
            select: { name: true, photoUrl: true }
        }
      },
      orderBy: { time: 'asc' }
    });
    res.json({ success: true, data: { schedules } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch schedules' });
  }
};

export const deleteSchedule = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await prisma.schedule.findFirst({ where: { id, userId } });
    if (!schedule) return res.status(404).json({ success: false, error: 'Schedule not found' });

    await prisma.schedule.delete({ where: { id } });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};

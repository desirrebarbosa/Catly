
import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createSchedule = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { catIds, taskName, time, recurrence } = req.body;

    // catIds is now an array
    if (!catIds || !Array.isArray(catIds) || catIds.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one cat is required' });
    }

    // Verify ownership of all cats
    const count = await prisma.cat.count({
        where: { 
            id: { in: catIds },
            ownerId: userId 
        }
    });

    if (count !== catIds.length) {
        return res.status(404).json({ success: false, error: 'One or more cats not found or unauthorized' });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        userId,
        cats: {
            connect: catIds.map(id => ({ id }))
        },
        taskName,
        time,
        recurrence
      },
      include: {
          cats: { select: { id: true, name: true, photoUrl: true } }
      }
    });

    res.status(201).json({ success: true, data: { schedule: newSchedule } });
  } catch (error) {
    console.error("Create Schedule Error:", error);
    res.status(500).json({ success: false, error: 'Failed to create schedule' });
  }
};

export const updateSchedule = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { catIds, taskName, time, recurrence } = req.body;
  
      const schedule = await prisma.schedule.findFirst({ where: { id, userId } });
      if (!schedule) return res.status(404).json({ success: false, error: 'Schedule not found' });
  
      const updatedSchedule = await prisma.schedule.update({
        where: { id },
        data: {
          taskName,
          time,
          recurrence,
          cats: catIds ? {
              set: catIds.map((cid: string) => ({ id: cid })) // Replaces existing relationships
          } : undefined
        },
        include: {
            cats: { select: { id: true, name: true, photoUrl: true } }
        }
      });
  
      res.json({ success: true, data: { schedule: updatedSchedule } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Update failed' });
    }
};

export const getSchedules = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const schedules = await prisma.schedule.findMany({
      where: { userId },
      include: {
        cats: {
            select: { id: true, name: true, photoUrl: true }
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

export const toggleComplete = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const schedule = await prisma.schedule.findFirst({ where: { id, userId } });
    if (!schedule) return res.status(404).json({ success: false, error: 'Not found' });

    // Logic: If completed today, toggle off. If not, set to now.
    const now = new Date();
    // @ts-ignore - Assuming schema has lastCompletedDate
    const last = schedule.lastCompletedDate ? new Date(schedule.lastCompletedDate) : null;
    
    let newDate: Date | null = now;
    
    if (last && last.toDateString() === now.toDateString()) {
        newDate = null; // Undo completion
    }

    const updated = await prisma.schedule.update({
        where: { id },
        data: { lastCompletedDate: newDate }
    });

    res.json({ success: true, data: { schedule: updated } });
  } catch (e) {
      console.error(e);
      res.status(500).json({success:false, error: 'Update failed. Ensure DB schema has lastCompletedDate.'});
  }
};

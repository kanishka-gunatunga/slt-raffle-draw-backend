import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getEvents = async (req: Request, res: Response) => {
    console.log("DEBUG: executing getEvents V5 - With Winners Include");
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            include: {
                gifts: true,
                winners: {
                    include: {
                        user: true,
                        gift: true
                    }
                }
            }
        });

        // Dynamic Status Update Logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updates = events.map(async (event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            let correctStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' = 'UPCOMING';

            if (event.winners && event.winners.length > 0) {
                correctStatus = 'COMPLETED';
            } else if (eventDate < today) {
                correctStatus = 'ACTIVE';
            } else if (eventDate.getTime() === today.getTime()) {
                correctStatus = 'ACTIVE';
            }

            if (event.status !== correctStatus) {
                // Update in DB
                await prisma.event.update({
                    where: { id: event.id },
                    data: { status: correctStatus }
                });
                // Update in memory for response
                event.status = correctStatus;
            }
        });

        await Promise.all(updates);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    const { title, date } = req.body;
    const enrollmentKey = crypto.randomUUID().split('-')[0].toUpperCase();

    try {
        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                enrollmentKey,
            },
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};

export const getEventById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: {
                gifts: true,
                attendances: { include: { user: true } },
                winners: { include: { user: true, gift: true } }
            }
        });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error });
    }
}


export const addParticipants = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userIds } = req.body; // Array of user IDs

    try {
        const eventId = parseInt(id);
        const records = userIds.map((userId: number) => ({
            eventId,
            userId,
            status: 'INVITED'
        }));

        // createMany is efficiently supported in MySQL
        const result = await prisma.attendance.createMany({
            data: records,
            skipDuplicates: true, // Ignore if already added
        });

        res.json({ message: 'Participants added', count: result.count });
    } catch (error) {
        res.status(500).json({ message: 'Error adding participants', error });
    }
};

export const addGift = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, imageUrl, rank } = req.body;
    try {
        const gift = await prisma.gift.create({
            data: {
                name,
                imageUrl,
                rank: parseInt(rank),
                eventId: parseInt(id)
            }
        });
        res.status(201).json(gift);
    } catch (error) {
    }
}

export const deleteGift = async (req: Request, res: Response) => {
    const { id, giftId } = req.params;
    try {
        await prisma.gift.delete({
            where: {
                id: parseInt(giftId),
                eventId: parseInt(id)
            }
        });
        res.json({ message: 'Gift deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gift', error });
    }
}

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.event.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
};

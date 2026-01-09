import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const markAttendance = async (req: Request, res: Response): Promise<any> => {
    const { eventId, userId } = req.body;
    try {
        const attendance = await prisma.attendance.upsert({
            where: {
                eventId_userId: {
                    eventId: parseInt(eventId),
                    userId: parseInt(userId),
                },
            },
            update: { status: 'PRESENT' },
            create: {
                eventId: parseInt(eventId),
                userId: parseInt(userId),
                status: 'PRESENT',
            },
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error });
    }
};

export const getCandidates = async (req: Request, res: Response): Promise<any> => {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ message: 'Event ID required' });

    try {
        // Find users present at the event
        const attendees = await prisma.attendance.findMany({
            where: {
                eventId: parseInt(eventId as string),
                status: 'PRESENT'
            },
            include: { user: true }
        });

        // Find existing winners for this event
        const winners = await prisma.winner.findMany({
            where: { eventId: parseInt(eventId as string) },
            select: { userId: true }
        });
        const winnerIds = new Set(winners.map(w => w.userId));

        // Filter out winners
        const candidates = attendees
            .filter(a => !winnerIds.has(a.userId))
            .map(a => a.user);

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching candidates', error });
    }
}

export const recordWinner = async (req: Request, res: Response) => {
    const { eventId, giftId, userId } = req.body;

    // Validate input
    if (!eventId || !giftId || !userId) {
        console.error("Missing required fields for recordWinner:", { eventId, giftId, userId });
        res.status(400).json({ message: 'Missing eventId, giftId, or userId' });
        return;
    }

    try {
        // Use upsert to allow re-drawing (updating the winner for this gift if it exists)
        const winner = await prisma.winner.upsert({
            where: {
                eventId_giftId: {
                    eventId: parseInt(eventId),
                    giftId: parseInt(giftId)
                }
            },
            update: {
                userId: parseInt(userId),
                wonAt: new Date() // Update timestamp on re-win
            },
            create: {
                eventId: parseInt(eventId),
                giftId: parseInt(giftId),
                userId: parseInt(userId)
            }
        });

        console.log("Winner recorded successfully:", winner);
        res.status(200).json(winner);
    } catch (error) {
        console.error("Error recording winner:", error);
        res.status(500).json({ message: 'Error recording winner', error: String(error) });
    }
}

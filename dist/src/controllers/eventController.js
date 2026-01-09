"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGift = exports.addGift = exports.addParticipants = exports.getEventById = exports.createEvent = exports.getEvents = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            include: { gifts: true }
        });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
};
exports.getEvents = getEvents;
const createEvent = async (req, res) => {
    const { title, date } = req.body;
    const enrollmentKey = crypto_1.default.randomUUID().split('-')[0].toUpperCase();
    try {
        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                enrollmentKey,
            },
        });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};
exports.createEvent = createEvent;
const getEventById = async (req, res) => {
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
        if (!event)
            return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching event', error });
    }
};
exports.getEventById = getEventById;
const addParticipants = async (req, res) => {
    const { id } = req.params;
    const { userIds } = req.body; // Array of user IDs
    try {
        const eventId = parseInt(id);
        const records = userIds.map((userId) => ({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding participants', error });
    }
};
exports.addParticipants = addParticipants;
const addGift = async (req, res) => {
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
    }
    catch (error) {
    }
};
exports.addGift = addGift;
const deleteGift = async (req, res) => {
    const { id, giftId } = req.params;
    try {
        await prisma.gift.delete({
            where: {
                id: parseInt(giftId),
                eventId: parseInt(id)
            }
        });
        res.json({ message: 'Gift deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting gift', error });
    }
};
exports.deleteGift = deleteGift;

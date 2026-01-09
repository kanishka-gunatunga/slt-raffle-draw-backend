import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
    const { name, location } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const user = await prisma.user.create({
            data: {
                name,
                location,
                photoUrl,
            },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Manually delete related records first to avoid foreign key constraints
        await prisma.attendance.deleteMany({ where: { userId } });
        await prisma.winner.deleteMany({ where: { userId } });
        // Delete user
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
}

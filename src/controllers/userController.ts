import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

// Configure Multer
export const upload = multer({ storage: multer.memoryStorage() });

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
    let photoUrl: string | null = null;

    if (req.file) {
        const filename = Date.now() + path.extname(req.file.originalname);
        try {
            // Define upload path - ensure this directory exists
            const uploadDir = path.join(process.cwd(), 'uploads');

            // Try to require fs-extra or fs to write the file
            // We use standard fs here for simplicity, or fs-extra if available
            const fs = require('fs');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);

            // Write buffer to file
            await fs.promises.writeFile(filepath, req.file.buffer);
            photoUrl = `/uploads/${filename}`;
        } catch (error) {
            console.warn("File upload skipped (likely readonly filesystem):", error);
            // On Vercel, we can't write to disk persistently without external storage.
            // We accept the user creation without the photo to prevent 500 error.
        }
    }

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
        console.error("Database error creating user:", error);
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

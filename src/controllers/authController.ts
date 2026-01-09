import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        // For initial entry, if no admin exists, we might want a seeder.
        // But for now, assume password matches hash.
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET as string, {
            expiresIn: '1d',
        });

        return res.json({ token, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed', error });
    }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin)
            return res.status(401).json({ message: 'Invalid credentials' });
        // For initial entry, if no admin exists, we might want a seeder.
        // But for now, assume password matches hash.
        const isValid = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!isValid)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });
        return res.json({ token, admin: { id: admin.id, username: admin.username } });
    }
    catch (error) {
        return res.status(500).json({ message: 'Login failed', error });
    }
};
exports.login = login;

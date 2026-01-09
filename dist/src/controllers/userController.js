"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getUsers = exports.upload = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Configure Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
exports.upload = (0, multer_1.default)({ storage });
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};
exports.createUser = createUser;
const deleteUser = async (req, res) => {
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
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
};
exports.deleteUser = deleteUser;

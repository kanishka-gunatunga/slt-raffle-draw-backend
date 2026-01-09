"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const username = 'admin';
    const password = 'password123';
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const admin = await prisma.admin.upsert({
        where: { username },
        update: {},
        create: {
            username,
            passwordHash,
        },
    });
    console.log({ admin });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

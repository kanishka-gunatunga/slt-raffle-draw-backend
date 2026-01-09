import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

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

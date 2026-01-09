import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const gifts = await prisma.$queryRaw`SHOW CREATE TABLE gifts`;
        console.log('GIFTS TABLE:', gifts);

        const winners = await prisma.$queryRaw`SHOW CREATE TABLE winners`;
        console.log('WINNERS TABLE:', winners);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

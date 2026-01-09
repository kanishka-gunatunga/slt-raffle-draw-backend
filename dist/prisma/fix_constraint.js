"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Dropping FK...');
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE winners DROP FOREIGN KEY winners_gift_id_fkey');
        }
        catch (e) {
            console.log('FK might not exist or already dropped:', e);
        }
        console.log('Dropping Index...');
        try {
            await prisma.$executeRawUnsafe('DROP INDEX gifts_event_id_rank_key ON gifts');
        }
        catch (e) {
            console.log('Index might not exist:', e);
        }
        console.log('Restoring FK...');
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE winners ADD CONSTRAINT winners_gift_id_fkey FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE RESTRICT ON UPDATE CASCADE');
        }
        catch (e) {
            console.error('Failed to restore FK:', e);
        }
        console.log('Done.');
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();

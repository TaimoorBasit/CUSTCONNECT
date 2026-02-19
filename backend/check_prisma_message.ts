
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Checking if prisma.message exists...');
        if (prisma.message) {
            console.log('✅ prisma.message exists');
            const count = await prisma.message.count();
            console.log('Count:', count);
        } else {
            console.log('❌ prisma.message does NOT exist');
            // List available keys to see what IS there
            console.log('Available keys:', Object.keys(prisma));
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting Printer Shop Owner Password...');

    const email = 'bookshop@custconnect.com';
    const password = 'Printer123!';

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`❌ User ${email} not found!`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    console.log(`✅ Password for ${email} has been reset to: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

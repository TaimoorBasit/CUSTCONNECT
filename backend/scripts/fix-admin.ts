import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@custconnect.com';
    const hashedPassword = await bcrypt.hash('admin123', 12);

    console.log('Attempting to fix admin user...');

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            username: 'admin',
            password: hashedPassword,
            isVerified: true,
            isActive: true
        },
        create: {
            email,
            username: 'admin',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            isVerified: true,
            isActive: true
        }
    });

    console.log('Admin user fixed:', user.email, 'Username:', user.username);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

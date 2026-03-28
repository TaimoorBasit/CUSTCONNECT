import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany({
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    console.log('--- USER DIAGNOSTIC ---');
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Email: ${u.email}`);
        console.log(`Username: ${u.username}`);
        console.log(`Verified: ${u.isVerified}`);
        console.log(`Active: ${u.isActive}`);
        console.log(`Roles: ${u.roles.map(r => r.role.name).join(', ')}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

checkUsers().catch(console.error);

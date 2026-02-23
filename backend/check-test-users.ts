import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTestUserRoles() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: 'Test' },
                { firstName: 'Test User' },
                { email: { contains: 'test' } }
            ]
        },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    for (const user of users) {
        console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log('Roles:', user.roles.map(ur => ur.role.name));
        console.log('---');
    }

    await prisma.$disconnect();
}

checkTestUserRoles().catch(console.error);

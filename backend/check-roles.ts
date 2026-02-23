import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminRoles() {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: 'Admin' },
                { username: 'admin' },
                { email: 'admin@admin.com' }
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

    if (user) {
        console.log('ID: ' + user.id);
        console.log('Email: ' + user.email);
        for (const ur of user.roles) {
            console.log('Role found: ' + ur.role.name);
        }
    } else {
        console.log('User not found');
    }

    await prisma.$disconnect();
}

checkAdminRoles().catch(console.error);

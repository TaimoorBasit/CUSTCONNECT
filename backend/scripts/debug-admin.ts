import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminByEmail = await prisma.user.findUnique({ where: { email: 'admin@custconnect.com' } });
    const adminByUsername = await prisma.user.findFirst({ where: { username: 'admin' } });

    console.log('User by email admin@custconnect.com:', adminByEmail?.email, 'Username:', adminByEmail?.username);
    console.log('User by username admin:', adminByUsername?.email, 'Username:', adminByUsername?.username);

    if (adminByUsername && adminByEmail && adminByUsername.id !== adminByEmail.id) {
        console.log('CONFLICT: username admin is taken by another user:', adminByUsername.email);
        // Delete the other user if they are just a test user
        if (adminByUsername.email?.includes('test') || adminByUsername.email?.includes('example')) {
            console.log('Resolving conflict by removing test user...');
            await prisma.user.delete({ where: { id: adminByUsername.id } });
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

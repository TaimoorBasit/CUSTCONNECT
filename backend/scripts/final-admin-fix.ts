import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Final Admin Fix starting...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Get a university and department id to assign
    const uni = await prisma.university.findFirst();
    const dept = await prisma.department.findFirst();

    if (!uni || !dept) {
        console.error('Missing seed data (uni/dept). Run npx prisma db seed first.');
        return;
    }

    // 1. Clear conflicts
    await prisma.user.updateMany({
        where: { username: 'admin' },
        data: { username: null }
    });

    // 2. Clear email conflicts
    const existingByEmail = await prisma.user.findUnique({ where: { email: 'admin@custconnect.com' } });

    // 3. Force fix admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@custconnect.com' },
        update: {
            username: 'admin',
            password: hashedPassword,
            isVerified: true,
            isActive: true,
            universityId: uni.id,
            departmentId: dept.id
        },
        create: {
            email: 'admin@custconnect.com',
            username: 'admin',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            isVerified: true,
            isActive: true,
            universityId: uni.id,
            departmentId: dept.id,
            year: 4
        }
    });

    // 4. Ensure Role
    const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (role) {
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: admin.id, roleId: role.id } },
            update: {},
            create: { userId: admin.id, roleId: role.id }
        });
    }

    console.log('✅ Admin fully restored and fixed.');
    console.log('Login: admin');
    console.log('Pass: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🛠️ Starting Printer Shop Owner Fix...');

    // 1. Find the Printer Shop without an owner
    const shop = await prisma.printerShop.findFirst({
        where: {
            name: 'BookShop',
            ownerId: null
        }
    });

    if (!shop) {
        console.log('⚠️ No unowned "BookShop" found. Checking if it already has an owner or does not exist...');
        const existingShop = await prisma.printerShop.findFirst({ where: { name: 'BookShop' } });
        if (existingShop?.ownerId) {
            console.log('✅ "BookShop" already has an owner.');
            return;
        }
        console.log('❌ "BookShop" not found at all.');
        return;
    }

    console.log(`✅ Found unowned shop: [${shop.id}] ${shop.name}`);

    // 2. Check if user already exists
    const email = 'bookshop@custconnect.com';
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log(`⚠️ User ${email} already exists. Linking to shop...`);
    } else {
        // 3. Create the user
        console.log(`👤 Creating user ${email}...`);

        // Get University (CUST)
        const university = await prisma.university.findFirst({
            where: { name: { contains: 'Capital University' } }
        });

        if (!university) {
            throw new Error('University not found');
        }

        // Get Department (CS)
        const department = await prisma.department.findFirst({
            where: { code: 'CS', universityId: university.id }
        });

        const hashedPassword = await bcrypt.hash('Printer123!', 10);

        user = await prisma.user.create({
            data: {
                firstName: 'Printer',
                lastName: 'Shop Owner',
                email,
                password: hashedPassword,
                isVerified: true,
                isActive: true,
                universityId: university.id,
                departmentId: department?.id
            }
        });
        console.log(`✅ User created: ${user.id}`);
    }

    // 4. Assign Role
    const roleName = 'PRINTER_SHOP_OWNER';
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    if (!role) {
        throw new Error(`Role ${roleName} not found`);
    }

    // Check if user has role
    const userRole = await prisma.userRole.findUnique({
        where: {
            userId_roleId: {
                userId: user!.id,
                roleId: role.id
            }
        }
    });

    if (!userRole) {
        await prisma.userRole.create({
            data: {
                userId: user!.id,
                roleId: role.id
            }
        });
        console.log(`✅ Role ${roleName} assigned to user.`);
    } else {
        console.log(`ℹ️ User already has role ${roleName}.`);
    }

    // 5. Link User to Shop
    await prisma.printerShop.update({
        where: { id: shop.id },
        data: { ownerId: user.id }
    });

    console.log(`✅ Successfully linked User ${user.email} to Printer Shop ${shop.name}`);
    console.log('🎉 Fix Complete!');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());

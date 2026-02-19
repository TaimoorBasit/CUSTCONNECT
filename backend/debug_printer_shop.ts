
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Debugging Printer Shops and Users...');

    // 1. List all Printer Shops
    const shops = await prisma.printerShop.findMany({
        include: {
            owner: {
                include: {
                    roles: {
                        include: { role: true }
                    }
                }
            }
        }
    });

    console.log(`\n🖨️  Found ${shops.length} Printer Shops:`);
    shops.forEach(shop => {
        console.log(`- [${shop.id}] ${shop.name}`);
        console.log(`  OwnerID: ${shop.ownerId}`);
        if (shop.owner) {
            console.log(`  Owner: ${shop.owner.firstName} ${shop.owner.lastName} (${shop.owner.email})`);
            console.log(`  Roles: ${shop.owner.roles.map(r => r.role.name).join(', ')}`);
        } else {
            console.log(`  ❌ NO OWNER LINKED`);
        }
    });

    // 2. List all Users with PRINTER_SHOP_OWNER role
    const roleName = 'PRINTER_SHOP_OWNER';
    const usersWithRole = await prisma.user.findMany({
        where: {
            roles: {
                some: {
                    role: { name: roleName }
                }
            }
        },
        include: {
            roles: { include: { role: true } },
            university: true
        }
    });

    console.log(`\n👤 Found ${usersWithRole.length} Users with role '${roleName}':`);
    usersWithRole.forEach(user => {
        console.log(`- [${user.id}] ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`  University: ${user.university?.name || 'NONE'}`);
        console.log(`  Roles: ${user.roles.map(r => r.role.name).join(', ')}`);
    });

    // 3. Check for specific email 'bookshop@custconnect.com'
    const email = 'bookshop@custconnect.com';
    const specificUser = await prisma.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } }
    });

    if (specificUser) {
        console.log(`\n📧 User with email '${email}' exists:`);
        console.log(`  ID: ${specificUser.id}`);
        console.log(`  Roles: ${specificUser.roles.map(r => r.role.name).join(', ')}`);
    } else {
        console.log(`\n❌ User with email '${email}' DOES NOT EXIST.`);
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

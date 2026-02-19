import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPrinterShopRole() {
  console.log('🔍 Verifying PRINTER_SHOP_OWNER role and users...\n');

  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { name: 'PRINTER_SHOP_OWNER' }
    });

    if (!role) {
      console.log('❌ PRINTER_SHOP_OWNER role does not exist!');
      console.log('📝 Creating PRINTER_SHOP_OWNER role...');
      
      const newRole = await prisma.role.create({
        data: {
          name: 'PRINTER_SHOP_OWNER',
          description: 'Printer Shop Owner',
          permissions: ['manage_printer_shop', 'view_print_requests', 'update_print_status']
        }
      });
      console.log('✅ Role created:', newRole);
    } else {
      console.log('✅ PRINTER_SHOP_OWNER role exists:', role);
    }

    // Find all users with PRINTER_SHOP_OWNER role
    const usersWithRole = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'PRINTER_SHOP_OWNER'
            }
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        ownedPrinterShops: true
      }
    });

    console.log(`\n👥 Found ${usersWithRole.length} user(s) with PRINTER_SHOP_OWNER role:`);
    usersWithRole.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log(`   - Verified: ${user.isVerified}`);
      console.log(`   - Roles: ${user.roles.map(ur => ur.role.name).join(', ')}`);
      console.log(`   - Printer Shops: ${user.ownedPrinterShops.length}`);
      user.ownedPrinterShops.forEach(shop => {
        console.log(`     • ${shop.name} (${shop.id})`);
      });
    });

    // Find all printer shops
    const shops = await prisma.printerShop.findMany({
      include: {
        owner: {
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    console.log(`\n🏪 Found ${shops.length} printer shop(s):`);
    shops.forEach((shop, index) => {
      console.log(`\n${index + 1}. ${shop.name}`);
      console.log(`   - ID: ${shop.id}`);
      console.log(`   - Active: ${shop.isActive}`);
      if (shop.owner) {
        console.log(`   - Owner: ${shop.owner.firstName} ${shop.owner.lastName} (${shop.owner.email})`);
        console.log(`   - Owner Roles: ${shop.owner.roles.map(ur => ur.role.name).join(', ')}`);
      } else {
        console.log(`   - Owner: ❌ No owner assigned`);
      }
    });

    console.log('\n✅ Verification complete!');
  } catch (error: any) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyPrinterShopRole()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




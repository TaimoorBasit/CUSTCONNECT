import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@custconnect.com';
  const plainPassword = 'Demo1234';

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('Demo user ready:');
  console.log(`  email:    ${user.email}`);
  console.log(`  password: ${plainPassword}`);
}

main()
  .catch((error) => {
    console.error('Failed to create demo user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });










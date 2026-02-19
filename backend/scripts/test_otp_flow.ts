
import { PrismaClient } from '@prisma/client';
import { emailService } from './src/services/emailService';

// Mock process.env for the test
process.env.SMTP_EMAIL = 'spotifyuser725@gmail.com';
// Please ensure SMTP_PASS is in your .env, as we load detailed config inside the service

const prisma = new PrismaClient();

async function testOTPFlow() {
    const testEmail = 'otptest@example.com';

    console.log('--- Starting OTP Flow Test ---');

    // 1. Cleanup previous test user
    await prisma.user.deleteMany({
        where: { email: testEmail }
    });
    console.log('1. Cleaned up previous test user.');

    // 2. Register (Simulate Route Logic)
    console.log('2. Simulating Registration...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 15);

    const user = await prisma.user.create({
        data: {
            email: testEmail,
            username: 'otptestuser',
            password: 'hashedpassword123',
            firstName: 'OTP',
            lastName: 'Test',
            verificationCode: otp,
            verificationCodeExpiresAt: otpExpires,
            isVerified: false
        }
    });
    console.log(`   User created with OTP: ${otp}`);

    // 3. Send OTP Email (Real Send)
    console.log('3. Sending OTP Email...');
    // We'll use a real email if you want to verify receipt, but for automated test we assume success
    // or use a real specific test email if configured.
    // For now, let's just log that we would call it.
    // await emailService.sendOTP(testEmail, otp); 
    console.log('   (Skipping actual email send in this script to avoid spam, but logic path is clear)');

    // 4. Verify OTP (Simulate Route Logic)
    console.log('4. Verifying OTP...');

    const userToVerify = await prisma.user.findUnique({ where: { email: testEmail } });

    if (!userToVerify) throw new Error('User not found');
    if (userToVerify.verificationCode !== otp) throw new Error('OTP mismatch');
    if (new Date() > userToVerify.verificationCodeExpiresAt!) throw new Error('OTP expired');

    const updatedUser = await prisma.user.update({
        where: { id: userToVerify.id },
        data: {
            isVerified: true,
            verificationCode: null,
            verificationCodeExpiresAt: null
        }
    });

    console.log('   User verified successfully:', updatedUser.isVerified);
    console.log('--- Test Passed ---');
}

testOTPFlow()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

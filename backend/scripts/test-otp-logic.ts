import dotenv from 'dotenv';
import path from 'path';

// Load env just like index.ts
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
console.log('Env Load Result:', result.error ? 'FAILED' : 'SUCCESS');
console.log('Env Path:', envPath);
console.log('SMTP_EMAIL from env:', process.env.SMTP_EMAIL);

import { emailService } from '../src/services/emailService';

async function testRegistrationOTP() {
    console.log('--- Testing OTP Send (App Logic Simulation) ---');
    const testEmail = process.env.SMTP_EMAIL || 'spotifyuser725@gmail.com';
    const testOTP = '123456';

    console.log(`Attempting to send OTP to: ${testEmail}`);

    try {
        // This calls the same sendOTP method used in auth.ts
        await emailService.sendOTP(testEmail, testOTP);
        console.log('✅ OTP Send method executed without throwing.');
        console.log('Please check the backend logs above for SMTP/Resend output.');
    } catch (error: any) {
        console.error('❌ Failed to execute sendOTP:', error.message);
    }
}

testRegistrationOTP();

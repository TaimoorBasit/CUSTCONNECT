import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { SMTP_EMAIL, SMTP_PASS } = process.env;

async function testEmail() {
    console.log('Testing SMTP connection...');
    console.log('User:', SMTP_EMAIL);

    if (!SMTP_EMAIL || !SMTP_PASS) {
        console.error('SMTP credentials missing in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ SMTP connection successful');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: SMTP_EMAIL,
            to: SMTP_EMAIL, // Send to yourself
            subject: 'CustConnect SMTP Test',
            text: 'If you receive this, your backend email configuration is working!'
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error: any) {
        console.error('❌ SMTP Test failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Authentication Error: Check if your App Password is correct.');
        } else if (error.code === 'ESOCKET') {
            console.error('Socket Error: Your server might be blocking port 587.');
        }
    }
}

testEmail();

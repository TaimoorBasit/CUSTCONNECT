import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { SMTP_EMAIL, SMTP_PASS, SMTP_FROM } = process.env;

async function runTests() {
    console.log('--- SMTP Diagnostic Test ---');
    console.log('Email:', SMTP_EMAIL);
    console.log('Pass:', SMTP_PASS ? '********' : 'MISSING');
    console.log('From:', SMTP_FROM);

    if (!SMTP_EMAIL || !SMTP_PASS) {
        console.error('❌ Error: Missing credentials in .env');
        return;
    }

    const configurations = [
        { name: 'Gmail TLS (587)', host: 'smtp.gmail.com', port: 587, secure: false },
        { name: 'Gmail SSL (465)', host: 'smtp.gmail.com', port: 465, secure: true }
    ];

    for (const config of configurations) {
        console.log(`\nTesting ${config.name}...`);
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: SMTP_EMAIL,
                pass: SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });

        try {
            await transporter.verify();
            console.log(`✅ ${config.name} connection successful!`);

            console.log(`Sending test email via ${config.name}...`);
            const info = await transporter.sendMail({
                from: SMTP_FROM || SMTP_EMAIL,
                to: SMTP_EMAIL,
                subject: `CustConnect Test - ${config.name}`,
                text: 'SMTP is working!'
            });
            console.log(`✅ Email sent! MessageID: ${info.messageId}`);
        } catch (err: any) {
            console.error(`❌ ${config.name} failed:`, err.message);
            if (err.code === 'EAUTH') {
                console.error('   Reason: Invalid credentials. Is the App Password still active?');
            } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
                console.error('   Reason: Connection timeout. Port might be blocked by firewall/ISP.');
            }
        }
    }
}

runTests();

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { SMTP_EMAIL, SMTP_PASS, SMTP_FROM } = process.env;

async function runTests() {
    let log = '--- SMTP Diagnostic Test Results ---\n';
    log += `Time: ${new Date().toISOString()}\n`;
    log += `Email: ${SMTP_EMAIL}\n`;
    log += `Pass: ${SMTP_PASS ? '********' : 'MISSING'}\n`;
    log += `From: ${SMTP_FROM}\n\n`;

    if (!SMTP_EMAIL || !SMTP_PASS) {
        log += '❌ Error: Missing credentials in .env\n';
        fs.writeFileSync('email-test-log.txt', log);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        log += 'Testing Gmail Service connection...\n';
        await transporter.verify();
        log += '✅ Gmail Service connection successful!\n';

        log += 'Sending test email...\n';
        const info = await transporter.sendMail({
            from: SMTP_FROM || SMTP_EMAIL,
            to: SMTP_EMAIL,
            subject: 'CustConnect Final SMTP Test',
            text: 'SMTP is working perfectly!'
        });
        log += `✅ Email sent! MessageID: ${info.messageId}\n`;
    } catch (err: any) {
        log += `❌ Test failed: ${err.message}\n`;
        log += `Code: ${err.code}\n`;
        log += `Stack: ${err.stack}\n`;
    }

    fs.writeFileSync('email-test-log.txt', log);
    console.log('Results written to email-test-log.txt');
}

runTests();

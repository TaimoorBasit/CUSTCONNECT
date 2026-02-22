
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { emailService } from '../src/services/emailService';

async function testEmail() {
  const recipient = 'shayanarain60@gmail.com'; // You can change this to test sending to yourself
  const subject = 'Test Email from CustConnect Backend';
  const html = `
    <h1>Success!</h1>
    <p>This is a test email sent from your CustConnect backend using Nodemailer and Gmail SMTP.</p>
    <p>Environment Check:</p>
    <ul>
      <li>SMTP_EMAIL: ${process.env.SMTP_EMAIL}</li>
      <li>SMTP_PASS: ${process.env.SMTP_PASS ? '******** (configured)' : 'MISSING'}</li>
    </ul>
    <p>Sent at: ${new Date().toLocaleString()}</p>
  `;

  console.log(`Attempting to send test email to ${recipient}...`);

  if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your-16-char-app-password') {
    console.error('❌ ERROR: You have not set your SMTP_PASS in .env yet!');
    console.error('Please generate an App Password from your Google Account and paste it into backend/.env');
    return;
  }

  const success = await emailService.sendEmail(recipient, subject, html);

  if (success) {
    console.log('✅ Email sent successfully!');
  } else {
    console.error('❌ Failed to send email. Check your console logs for details.');
  }
}

testEmail();

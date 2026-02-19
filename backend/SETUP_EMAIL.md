# Email Service Setup Guide

To enable email notifications in CustConnect, you need to configure the Gmail SMTP settings.

## 1. Prerequisites
The backend uses **Nodemailer** with Gmail service. 
Ensure dependencies are installed:
```bash
cd backend
npm install nodemailer dotenv
npm install --save-dev @types/nodemailer
```

## 2. Environment Configuration
Add the following variables to your `backend/.env` file:

```env
# Email Configuration (Gmail)
SMTP_EMAIL=spotifyuser725@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:3000
```
> **Note:** Replace `xxxx xxxx xxxx xxxx` with your actual Gmail App Password (see below).

## 3. How to Generate Gmail App Password
For security, do **NOT** use your normal Gmail password. You must generate an App Password:

1.  Go to your [Google Account Settings](https://myaccount.google.com/).
2.  Navigate to **Security** > **2-Step Verification**.
    *   *If 2-Step Verification is not enabled, you must enable it first.*
3.  Scroll to the bottom and select **App passwords**.
4.  Enter a name (e.g., "CustConnect Backend").
5.  Click **Create**.
6.  Copy the 16-character code (remove spaces if you prefer, though Nodemailer handles them) and paste it into your `.env` file as `SMTP_PASS`.

## 4. Example Usage

```typescript
import { emailService } from './services/emailService';

async function sendOTP() {
  const userEmail = 'student@university.edu';
  const otp = '123456';
  
  const sent = await emailService.sendEmail(
    userEmail,
    'Your Login Verification Code',
    `<p>Your OTP code is: <strong>${otp}</strong></p>`
  );

  if (sent) {
    console.log('OTP sent successfully!');
  } else {
    console.error('Failed to send OTP.');
  }
}
```

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { to, subject, html, secret } = await req.json();

        // Verify internal secret to prevent unauthorized use
        const internalSecret = process.env.INTERNAL_EMAIL_KEY || 'default_secret_please_change';
        if (secret !== internalSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Debug logs for environment variables (safely)
        console.log(`[VercelBridge] Attempting to send email to ${to}`);
        console.log(`[VercelBridge] SMTP_EMAIL configured: ${!!process.env.SMTP_EMAIL}`);
        console.log(`[VercelBridge] SMTP_PASS configured: ${!!process.env.SMTP_PASS}`);

        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
            console.error('[VercelBridge] Missing SMTP credentials on Vercel');
            return NextResponse.json({ error: 'SMTP credentials missing on Vercel' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vercel Email Bridge Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

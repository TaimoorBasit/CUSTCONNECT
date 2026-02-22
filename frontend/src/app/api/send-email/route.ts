import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { to, subject, html, secret } = await req.json();

        // Basic security check
        const internalSecret = process.env.INTERNAL_EMAIL_KEY || 'custconnect_secret_2024';
        if (secret !== internalSecret) {
            return NextResponse.json({ error: 'Unauthorized bridge access' }, { status: 401 });
        }

        const { SMTP_EMAIL, SMTP_PASS } = process.env;

        if (!SMTP_EMAIL || !SMTP_PASS) {
            return NextResponse.json({ error: 'Bridge SMTP credentials missing' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SMTP_EMAIL,
                pass: SMTP_PASS
            }
        });

        console.log(`[Bridge] Sending email to ${to}...`);
        await transporter.sendMail({
            from: `CustConnect <${SMTP_EMAIL}>`,
            to,
            subject,
            html
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Bridge Error]:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

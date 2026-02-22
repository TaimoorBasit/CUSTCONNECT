import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

class EmailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend | null = null;
  private readonly hasSmtpConfig: boolean;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor() {
    const { SMTP_EMAIL, SMTP_PASS, SMTP_FROM, EMAIL_FROM, FRONTEND_URL, RESEND_API_KEY } = process.env;

    // Initialize Resend if API key is provided
    if (RESEND_API_KEY) {
      console.log('[EmailService] Initializing with Resend API...');
      this.resend = new Resend(RESEND_API_KEY);
    }

    // Validate SMTP fallback
    this.hasSmtpConfig = Boolean(SMTP_EMAIL && SMTP_PASS);

    // Use SMTP_FROM or EMAIL_FROM if provided, otherwise fallback to SMTP_EMAIL
    // For Gmail, the 'from' email should ideally match the SMTP_EMAIL account
    this.fromAddress = SMTP_FROM || EMAIL_FROM || `"CustConnect" <${SMTP_EMAIL}>` || 'onboarding@resend.dev';
    this.frontendUrl = FRONTEND_URL || 'http://localhost:3000';

    if (this.hasSmtpConfig) {
      console.log(`[EmailService] SUCCESS: SMTP credentials detected for ${SMTP_EMAIL}`);
      console.log(`[EmailService] From header will be: ${this.fromAddress}`);
      console.log(`[EmailService] Target: smtp.gmail.com:587 (STARTTLS)`);

      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Using 'gmail' shortcut is more reliable for Nodemailer
        auth: {
          user: SMTP_EMAIL,
          pass: SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      console.error('[EmailService] CRITICAL: SMTP not configured. Missing credentials.');
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  /**
   * Generic send email function
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const { INTERNAL_EMAIL_KEY, FRONTEND_URL, EMAIL_BRIDGE_ENABLED } = process.env;

    console.log(`[EmailService] ATTEMPTING SEND: To=${to}, Subject=${subject}`);
    console.log(`[EmailService] Config State: SMTP=${this.hasSmtpConfig}, Resend=${Boolean(this.resend)}`);

    // Vercel Bridge is disabled because the frontend is using 'output: export'
    // which prevents API routes from functioning on Vercel.

    // 1. Try Resend API (Alternative Cloud Provider)
    if (this.resend) {
      try {
        console.log(`[EmailService] Attempting Resend API for ${to}...`);
        const fromHeader = `CustConnect <${this.fromAddress}>`;

        const { data, error } = await this.resend.emails.send({
          from: fromHeader,
          to,
          subject,
          html
        });

        if (!error && data) {
          console.log(`[EmailService] Success: Email sent via Resend: ${data.id}`);
          return true;
        }
        console.error('[EmailService] Resend API Error:', error);
      } catch (resendError: any) {
        console.error('[EmailService] Resend exception:', resendError.message);
      }
    }

    // 3. Fallback to SMTP (Direct Connect)
    if (this.hasSmtpConfig) {
      try {
        console.log(`[EmailService] Final Fallback: Attempting Direct SMTP for ${to}...`);
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to,
          subject,
          html
        });

        console.log(`[EmailService] Success: Email sent via SMTP: ${info.messageId}`);
        return true;
      } catch (error: any) {
        console.error('[EmailService] Direct SMTP Failed (Common on Railway/Cloud):', {
          message: error.message,
          code: error.code,
          response: error.response
        });
        return false;
      }
    }

    console.error('[EmailService] No valid email transport available');
    return false;
  }


  // Legacy/Specific methods rewritten to use sendEmail or keep logic
  // Keeping dispatchMail logic but updating to use the configured transporter is fine, 
  // or we can refactor them to call sendEmail. 
  // Let's refactor them to call sendEmail for consistency and reusability.



  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
    const subject = 'Reset Your CustConnect Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy this link: <br><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendNotificationEmail(email: string, subject: string, message: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Notification</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          ${message}
        </div>
      </div>
    `;
    await this.sendEmail(email, `CustConnect: ${subject}`, html);
  }

  // Private helper can be removed if specific methods now call sendEmail directly, 
  // or kept if needed. The request asked for a reusable sendEmail function.
  // I will remove dispatchMail as it is redundant now.

  async sendOTP(email: string, otp: string): Promise<boolean> {
    const subject = 'Your Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Thank you for registering with CustConnect. Please use the following code to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">
            ${otp}
          </span>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();


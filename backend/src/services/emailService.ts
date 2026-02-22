import nodemailer from 'nodemailer';
import { Resend } from 'resend';

class EmailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend | null = null;
  private readonly hasSmtpConfig: boolean;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor() {
    const { SMTP_EMAIL, SMTP_PASS, SMTP_FROM, FRONTEND_URL, RESEND_API_KEY } = process.env;

    // Initialize Resend if API key is provided
    if (RESEND_API_KEY) {
      console.log('[EmailService] Initializing with Resend API...');
      this.resend = new Resend(RESEND_API_KEY);
    }

    // Validate SMTP fallback
    this.hasSmtpConfig = Boolean(SMTP_EMAIL && SMTP_PASS);
    // Use SMTP_FROM if provided, otherwise fallback to SMTP_EMAIL
    this.fromAddress = SMTP_FROM || SMTP_EMAIL || 'onboarding@resend.dev';
    this.frontendUrl = FRONTEND_URL || 'http://localhost:3000';

    if (this.hasSmtpConfig) {
      console.log(`[EmailService] Configuring SMTP for ${SMTP_EMAIL}...`);
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: SMTP_EMAIL,
          pass: SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Helps with self-signed certs in dev/some hosting
        }
      });
    } else {
      console.warn('[EmailService] SMTP not configured. Using mock transport.');
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

    // Only try Vercel Bridge if explicitly enabled or if we have a secret
    if (EMAIL_BRIDGE_ENABLED === 'true' && INTERNAL_EMAIL_KEY) {
      const bridgeUrl = `${(FRONTEND_URL || 'https://custconnect.vercel.app').replace(/\/$/, '')}/api/send-email`;

      try {
        console.log(`[EmailService] Attempting Vercel Bridge: ${bridgeUrl}...`);
        const response = await fetch(bridgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            subject,
            html,
            secret: INTERNAL_EMAIL_KEY
          })
        });

        if (response.ok) {
          console.log('[EmailService] Email sent successfully via Bridge');
          return true;
        }
        console.warn('[EmailService] Bridge failed with status:', response.status);
      } catch (vError: any) {
        console.error('[EmailService] Bridge fetch failed:', vError.message);
      }
    }

    // 2. Try Resend API
    if (this.resend) {
      try {
        console.log(`[EmailService] Attempting Resend API for ${to}...`);
        const fromHeader = this.fromAddress.includes('<') ? this.fromAddress : `CustConnect <${this.fromAddress}>`;

        const { data, error } = await this.resend.emails.send({
          from: fromHeader,
          to,
          subject,
          html
        });

        if (!error && data) {
          console.log(`[EmailService] Email sent via Resend: ${data.id}`);
          return true;
        }
        console.error('[EmailService] Resend API Error:', error);
      } catch (resendError: any) {
        console.error('[EmailService] Resend exception:', resendError.message);
      }
    }

    // 3. Fallback to SMTP
    if (this.hasSmtpConfig) {
      try {
        console.log(`[EmailService] Using SMTP for ${to}...`);
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to,
          subject,
          html
        });

        console.log(`[EmailService] Email sent via SMTP: ${info.messageId}`);
        return true;
      } catch (error: any) {
        console.error('[EmailService] SMTP failed:', error.message);
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

  async sendOTP(email: string, otp: string): Promise<void> {
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

    await this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();


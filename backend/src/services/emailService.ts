import nodemailer from 'nodemailer';
import { Resend } from 'resend';

class EmailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend | null = null;
  private readonly hasSmtpConfig: boolean;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor() {
    const { SMTP_EMAIL, SMTP_PASS, FRONTEND_URL, RESEND_API_KEY } = process.env;

    // Initialize Resend if API key is provided (Best for Railway/Cloud)
    if (RESEND_API_KEY) {
      console.log('[EmailService] Initializing with Resend API (Recommended)...');
      this.resend = new Resend(RESEND_API_KEY);
    }

    // Validate SMTP fallback
    this.hasSmtpConfig = Boolean(SMTP_EMAIL && SMTP_PASS);
    this.fromAddress = SMTP_EMAIL || 'onboarding@resend.dev'; // Resend default for testing
    this.frontendUrl = FRONTEND_URL || 'http://localhost:3000';

    if (this.hasSmtpConfig) {
      console.log(`[EmailService] Configuring SMTP Fallback for ${SMTP_EMAIL}...`);
      this.transporter = nodemailer.createTransport({
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

      // We don't verify SMTP here to avoid blocking startup since we know it might fail on Railway
    } else {
      console.warn('[EmailService] SMTP fallback not configured. Using mock transport.');
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  /**
   * Generic send email function
   * @param to Recipient email
   * @param subject Email subject
   * @param html Email body in HTML
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // 1. Try Resend API first (Bypasses SMTP blocks on Railway)
    if (this.resend) {
      try {
        console.log(`[EmailService] Attempting to send via Resend API to ${to}...`);
        const { data, error } = await this.resend.emails.send({
          from: this.fromAddress.includes('<') ? this.fromAddress : `CustConnect <${this.fromAddress}>`,
          to,
          subject,
          html
        });

        if (error) {
          console.error('[EmailService] Resend API Error:', error);
          // Don't return yet, try SMTP fallback below
        } else {
          console.log(`[EmailService] Email sent via Resend: ${data?.id}`);
          return true;
        }
      } catch (resendError) {
        console.error('[EmailService] Resend exception:', resendError);
      }
    }

    // 2. Fallback to SMTP
    if (!this.hasSmtpConfig) {
      console.warn(`[EmailService] No SMTP config found for fallback to ${to}`);
      return false;
    }

    try {
      console.log(`[EmailService] Falling back to SMTP for ${to}...`);
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html
      });

      console.log(`[EmailService] Email sent via SMTP: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[EmailService] SMTP Fallback failed:', error);
      return false;
    }
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


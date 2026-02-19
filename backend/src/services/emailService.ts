import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly hasSmtpConfig: boolean;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor() {
    const { SMTP_EMAIL, SMTP_PASS, FRONTEND_URL } = process.env;

    // Validate required environment variables
    this.hasSmtpConfig = Boolean(SMTP_EMAIL && SMTP_PASS);
    this.fromAddress = SMTP_EMAIL || 'CustConnect <no-reply@custconnect.dev>';
    this.frontendUrl = FRONTEND_URL || 'http://localhost:3000';

    if (this.hasSmtpConfig) {
      console.log('[EmailService] Initializing SMTP for Gmail...');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: SMTP_EMAIL,
          pass: SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('[EmailService] SMTP Connection Error:', error);
        } else {
          console.log('[EmailService] SMTP Server is ready to take our messages');
        }
      });
    } else {
      console.warn('[EmailService] SMTP_EMAIL or SMTP_PASS missing. Email sending will be disabled/mocked.');
      // Mock transporter for development without creds
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
    if (!this.hasSmtpConfig) {
      console.warn(`[EmailService] Mock send to ${to}: ${subject}`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html
      });

      console.log(`[EmailService] Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Error sending email:', error);
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


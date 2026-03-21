import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get('SMTP_USER');
    const password = this.configService.get('SMTP_PASSWORD');
    const fromEmail = this.configService.get(
      'SMTP_FROM_EMAIL',
      'noreply@examprep.com',
    );
    const fromName = this.configService.get('SMTP_FROM_NAME', 'ExamPrep');

    if (host && user && password) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass: password,
        },
      });

      (this.transporter as any).defaults = {
        from: `"${fromName}" <${fromEmail}>`,
      };
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 EMAIL (Development Mode):');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text || options.html.substring(0, 200)}...`);
      console.log('---');
      return true;
    }

    try {
      await this.transporter.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Reset your ExamPrep password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .content { background: white; padding: 20px; border-radius: 8px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ExamPrep</div>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested a password reset for your ExamPrep account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetLink}</p>
              <p><strong>This link expires in 1 hour.</strong></p>
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ExamPrep. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Reset your ExamPrep password\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to ExamPrep!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
            .content { background: white; padding: 20px; border-radius: 8px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ExamPrep</div>
            </div>
            <div class="content">
              <h2>Welcome, ${firstName}!</h2>
              <p>Thank you for joining ExamPrep. We're excited to help you prepare for your exams.</p>
              <p>Get started by:</p>
              <ul>
                <li>Exploring our exam courses</li>
                <li>Taking practice tests</li>
                <li>Setting your study goals</li>
              </ul>
              <div style="text-align: center;">
                <a href="#" class="button">Get Started</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
}

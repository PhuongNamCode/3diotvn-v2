import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { EmailConfig, EmailData } from './types';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async getEmailConfig(): Promise<EmailConfig | null> {
    try {
      // Priority 1: Check for admin panel overrides first
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['integrations.smtpHost', 'integrations.smtpUsername', 'integrations.smtpPassword']
          }
        }
      });

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string | null>);

      // Priority 2: Use .env variables as default, admin panel as override
      const host = settingsMap['integrations.smtpHost'] || process.env.SMTP_HOST;
      const user = settingsMap['integrations.smtpUsername'] || process.env.SMTP_USERNAME;
      const pass = settingsMap['integrations.smtpPassword'] || process.env.SMTP_PASSWORD;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : (host?.includes('gmail') ? 587 : 587);
      const secure = process.env.SMTP_SECURE === 'true';

      if (!host || !user || !pass) {
        console.warn('SMTP configuration incomplete. Please check .env file or admin panel settings.');
        console.warn('Required: SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD');
        return null;
      }

      console.log(`📧 Using SMTP: ${host} (${settingsMap['integrations.smtpHost'] ? 'Admin Panel' : 'Environment'})`);

      return {
        host,
        port,
        secure,
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      };
    } catch (error) {
      console.error('Error getting email config:', error);
      return null;
    }
  }

  async initializeTransporter(): Promise<boolean> {
    const config = await this.getEmailConfig();
    if (!config) {
      return false;
    }

    try {
      this.transporter = nodemailer.createTransport(config);
      
      // Verify connection
      await this.transporter!.verify();
      console.log('Email transporter initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing email transporter:', error);
      this.transporter = null;
      return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.transporter) {
      const initialized = await this.initializeTransporter();
      if (!initialized) {
        console.error('Email transporter not available');
        return false;
      }
    }

    try {
      const info = await this.transporter!.sendMail({
        from: `"3D IoT Community" <${(await this.getEmailConfig())?.auth.user}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();

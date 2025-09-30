import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { EmailConfig, EmailData } from './types';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async getEmailConfig(): Promise<EmailConfig | null> {
    try {
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

      const host = settingsMap['integrations.smtpHost'];
      const user = settingsMap['integrations.smtpUsername'];
      const pass = settingsMap['integrations.smtpPassword'];

      if (!host || !user || !pass) {
        console.warn('SMTP configuration incomplete');
        return null;
      }

      return {
        host,
        port: host.includes('gmail') ? 587 : 587, // Default SMTP port
        secure: false, // Use STARTTLS
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

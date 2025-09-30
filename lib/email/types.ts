export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface RegistrationEmailData {
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventPrice?: number;
  onlineLink?: string;
}

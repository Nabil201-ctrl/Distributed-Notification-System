import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly defaultFrom: string;
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.defaultFrom = this.config.get<string>('EMAIL_FROM', 'notifications@example.com');

    // -----------------------------
    // GMAIL API OAUTH2 TRANSPORTER
    // -----------------------------
    const clientId = this.config.get<string>('GMAIL_CLIENT_ID');
    const clientSecret = this.config.get<string>('GMAIL_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GMAIL_REDIRECT_URI');
    const refreshToken = this.config.get<string>('GMAIL_REFRESH_TOKEN');
    const userEmail = this.config.get<string>('GMAIL_USER');

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        // user: userEmail,
        clientId,
        clientSecret,
        refreshToken,
        accessToken: async () => {
          const tokenResponse = await oAuth2Client.getAccessToken();
          return tokenResponse.token;
        },
      },
    });
  }

  async sendEmail(payload: SendEmailPayload): Promise<{ messageId: string }> {
    const from = payload.from ?? this.defaultFrom;
    const messageId = `email_${Date.now()}_${randomUUID()}`;

    try {
      this.logger.log(`Sending email via Gmail → to=${payload.to} subject="${payload.subject}"`);

      const info = await this.transporter.sendMail({
        // from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        headers: {
          'X-Custom-Message-Id': messageId,
        },
      });

      this.logger.log(`Gmail email sent: ${info.messageId}`);
      return { messageId: info.messageId ?? messageId };
    } catch (error) {
      this.logger.error('Gmail email send error', error);
      throw error;
    }
  }
}

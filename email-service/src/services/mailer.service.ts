import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

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

  constructor(private readonly config: ConfigService) {
    this.defaultFrom = this.config.get<string>('EMAIL_FROM', 'notifications@example.com');
  }

  async sendEmail(payload: SendEmailPayload): Promise<{ messageId: string }> {
    const from = payload.from ?? this.defaultFrom;
    const messageId = `email_${Date.now()}_${randomUUID()}`;

    
    this.logger.log(`Sending email to ${payload.to} from ${from} with subject "${payload.subject}"`);
    this.logger.verbose(payload.html);

    
    await new Promise(resolve => setTimeout(resolve, 200));

    this.logger.log(`Email dispatched with message id ${messageId}`);
    return { messageId };
  }
}

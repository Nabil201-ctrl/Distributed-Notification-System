import { ConfigService } from '@nestjs/config';
export interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
    from?: string;
}
export declare class MailerService {
    private readonly config;
    private readonly logger;
    private readonly defaultFrom;
    constructor(config: ConfigService);
    sendEmail(payload: SendEmailPayload): Promise<{
        messageId: string;
    }>;
}

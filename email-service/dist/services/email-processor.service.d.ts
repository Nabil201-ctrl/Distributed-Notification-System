import { RmqContext } from '@nestjs/microservices';
import type { QueueMessage } from '../interfaces/queue-message.interface';
import { TemplateClientService } from './template-client.service';
import { UserClientService } from './user-client.service';
import { MailerService } from './mailer.service';
import { NotificationStatusService } from './notification-status.service';
import { EmailLogService } from './email-log.service';
export declare class EmailProcessorService {
    private readonly templateClient;
    private readonly userClient;
    private readonly mailer;
    private readonly statusService;
    private readonly emailLogService;
    private readonly logger;
    constructor(templateClient: TemplateClientService, userClient: UserClientService, mailer: MailerService, statusService: NotificationStatusService, emailLogService: EmailLogService);
    handleQueueMessage(payload: QueueMessage, context: RmqContext): Promise<void>;
    processPayload(payload: QueueMessage): Promise<string | undefined>;
    private renderTemplate;
    private deepGet;
}

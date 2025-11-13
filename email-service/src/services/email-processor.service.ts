import { Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { QueueMessage } from '../interfaces/queue-message.interface';
import { TemplateClientService } from './template-client.service';
import { UserClientService } from './user-client.service';
import { MailerService } from './mailer.service';
import { NotificationStatusService } from './notification-status.service';
import { EmailLogService } from './email-log.service';

@Injectable()
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);

  constructor(
    private readonly templateClient: TemplateClientService,
    private readonly userClient: UserClientService,
    private readonly mailer: MailerService,
    private readonly statusService: NotificationStatusService,
    private readonly emailLogService: EmailLogService,
  ) {}

  @EventPattern('email')
  async handleQueueMessage(@Payload() payload: QueueMessage, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.processPayload(payload);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Failed to process ${payload.correlation_id}: ${error.message}`);
      await this.statusService.updateStatus(payload.correlation_id, 'failed');
      channel.nack(originalMsg, false, false);
    }
  }

  async processPayload(payload: QueueMessage) {
    this.logger.log(`Processing ${payload.correlation_id ?? 'n/a'}`);

    await this.statusService.updateStatus(payload.correlation_id, 'processing');

    const [template, contactInfo] = await Promise.all([
      this.templateClient.getTemplate(payload.template_id),
      this.userClient.getContactInfo(payload.user_id),
    ]);

    if (!contactInfo.preferences.email) {
      this.logger.warn(`User ${payload.user_id} opted out of email notifications`);
      await this.statusService.updateStatus(payload.correlation_id, 'failed');
      return;
    }

    const rendered = this.renderTemplate(template.body, payload.variables);

    const { messageId } = await this.mailer.sendEmail({
      to: contactInfo.email,
      subject: template['subject'] ?? template.name,
      html: rendered,
    });

    this.emailLogService.record({
      messageId,
      userId: payload.user_id,
      templateId: payload.template_id,
      to: contactInfo.email,
      subject: template['subject'] ?? template.name,
      variables: payload.variables,
      sentAt: new Date().toISOString(),
    });

    await this.statusService.updateStatus(payload.correlation_id, 'sent');
    return messageId;
  }

  private renderTemplate(body: string, variables: Record<string, any>) {
    return body.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      const value = this.deepGet(variables, key);
      return value ?? '';
    });
  }

  private deepGet(source: Record<string, any>, path: string) {
    return path.split('.').reduce<any>((acc, segment) => (acc ? acc[segment] : undefined), source);
  }
}

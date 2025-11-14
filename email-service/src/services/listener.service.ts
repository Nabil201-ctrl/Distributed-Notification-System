import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface QueuePayload {
  user_id: string;
  template: string;
  variables: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class EmailQueueListenerService implements OnModuleInit {
  private readonly logger = new Logger(EmailQueueListenerService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private QUEUE_NAME: string;
  private USER_SERVICE_URL: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {
    this.QUEUE_NAME = this.config.get<string>('EMAIL_QUEUE', 'push.queue');
    this.USER_SERVICE_URL = this.config.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  async onModuleInit() {
    await this.connectQueue();
  }

  private async connectQueue() {
    try {
      this.connection = await amqp.connect(
        this.config.get<string>('RABBITMQ_URL', 'amqp://localhost'),
      );
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });

      this.logger.log(`Listening for messages on queue "${this.QUEUE_NAME}"`);

      this.channel.consume(this.QUEUE_NAME, async (msg) => {
        if (msg) {
          try {
            const payload: QueuePayload = JSON.parse(msg.content.toString());

            const userResp = await axios.get(
              `${this.USER_SERVICE_URL}/${payload.user_id}/contact-info`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.USER_SERVICE_TOKEN}`,
                },
              },
            );
            const userEmail = userResp.data.email;
            if (!userEmail) throw new Error('User email not found');

            const emailHtml = this.resolveTemplate(
              payload.template,
              payload.variables,
            );

            await this.mailerService.sendEmail({
              to: userEmail,
              subject: `Your ${payload.template.replace('_', ' ')} Email`,
              html: emailHtml,
            });

            this.channel.ack(msg);
            this.logger.log(`Email sent to ${userEmail}`);
          } catch (err) {
            this.logger.error('Failed to process queue message', err);
            this.channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      this.logger.error('Error connecting to queue', error);
      setTimeout(() => this.connectQueue(), 5000);
    }
  }

  private resolveTemplate(
    template: string,
    variables: Record<string, any>,
  ): string {
    if (template === 'welcome_email') {
      return `<p>Hi ${variables.name}, welcome to our platform!</p>`;
    }
    return `<p>Hello ${variables.name}</p>`;
  }
}

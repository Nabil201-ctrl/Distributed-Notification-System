import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, type ChannelModel, type Channel } from 'amqplib';
import { QueueMessage } from '../interfaces/notification.interface';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: Channel;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');

      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL environment variable is not configured');
      }

      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange('notifications.direct', 'direct', { durable: true });
      await this.channel.assertQueue('email.queue', { durable: true });
      await this.channel.assertQueue('push.queue', { durable: true });
      await this.channel.bindQueue('email.queue', 'notifications.direct', 'email');
      await this.channel.bindQueue('push.queue', 'notifications.direct', 'push');

      this.isConnected = true;
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
    } catch (err) {
      console.error('Error while disconnecting from RabbitMQ:', err);
    }
  }

  async publishMessage(type: 'email' | 'push', message: QueueMessage): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }

    const routingKey = type;
    const messageBuffer = Buffer.from(JSON.stringify(message));

    return this.channel.publish('notifications.direct', routingKey, messageBuffer, { persistent: true });
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

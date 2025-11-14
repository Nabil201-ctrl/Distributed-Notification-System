import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, type ChannelModel, type Channel } from 'amqplib';
import type { QueueMessage } from '../interfaces/notification.interface';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: ChannelModel;
  private channel!: Channel;
  private isConnected = false;

  private readonly EXCHANGE = 'notifications.direct';
  private readonly EMAIL_QUEUE = 'email.queue';
  private readonly PUSH_QUEUE = 'push.queue';
  private readonly FAILED_QUEUE = 'failed.queue';

  constructor(private readonly configService: ConfigService) { }

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

      this.logger.log('Connecting to RabbitMQ...');
      this.connection = await connect(rabbitmqUrl, {
        heartbeat: 60,
      });

      // Handle connection events
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });

      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(1);

      // Declare exchange
      await this.channel.assertExchange(this.EXCHANGE, 'direct', {
        durable: true,
      });

      // Declare failed/dead-letter queue first
      await this.channel.assertQueue(this.FAILED_QUEUE, {
        durable: true,
      });

      // Declare email queue with DLX
      await this.channel.assertQueue(this.EMAIL_QUEUE, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.EXCHANGE,
          'x-dead-letter-routing-key': 'failed',
        },
      });

      // Declare push queue with DLX
      await this.channel.assertQueue(this.PUSH_QUEUE, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.EXCHANGE,
          'x-dead-letter-routing-key': 'failed',
        },
      });

      // Bind queues to exchange
      await this.channel.bindQueue(this.EMAIL_QUEUE, this.EXCHANGE, 'email');
      await this.channel.bindQueue(this.PUSH_QUEUE, this.EXCHANGE, 'push');
      await this.channel.bindQueue(this.FAILED_QUEUE, this.EXCHANGE, 'failed');

      this.isConnected = true;
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      this.isConnected = false;
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (err) {
      this.logger.error('Error while disconnecting from RabbitMQ:', err);
    }
  }

  async publishMessage(
    type: 'email' | 'push',
    message: QueueMessage,
  ): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('RabbitMQ not connected, attempting to reconnect...');
      await this.connect();
    }

    try {
      const routingKey = type;
      const messageBuffer = Buffer.from(JSON.stringify(message));

      // Set priority based on message priority
      const priority =
        message.priority === 'high' ? 10 : message.priority === 'normal' ? 5 : 1;

      const published = this.channel.publish(
        this.EXCHANGE,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          messageId: message.correlation_id,
          priority,
          headers: {
            'x-retry-count': 0,
          },
        },
      );

      if (published) {
        this.logger.log(
          `Published ${type} notification: ${message.correlation_id}`,
        );
      } else {
        this.logger.warn('Channel buffer full - message may be delayed');
      }

      return published;
    } catch (error) {
      this.logger.error(`Error publishing ${type} notification:`, error);
      throw error;
    }
  }

  async getQueueStats(): Promise<any> {
    if (!this.isConnected || !this.channel) {
      return null;
    }

    try {
      const emailQueue = await this.channel.checkQueue(this.EMAIL_QUEUE);
      const pushQueue = await this.channel.checkQueue(this.PUSH_QUEUE);
      const failedQueue = await this.channel.checkQueue(this.FAILED_QUEUE);

      return {
        [this.EMAIL_QUEUE]: {
          messageCount: emailQueue.messageCount,
          consumerCount: emailQueue.consumerCount,
        },
        [this.PUSH_QUEUE]: {
          messageCount: pushQueue.messageCount,
          consumerCount: pushQueue.consumerCount,
        },
        [this.FAILED_QUEUE]: {
          messageCount: failedQueue.messageCount,
          consumerCount: failedQueue.consumerCount,
        },
      };
    } catch (error) {
      this.logger.error('Error getting queue stats:', error);
      return null;
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.channel !== undefined;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isHealthy()) {
        return false;
      }
      await this.channel.checkQueue(this.EMAIL_QUEUE);
      return true;
    } catch (error) {
      return false;
    }
  }
}
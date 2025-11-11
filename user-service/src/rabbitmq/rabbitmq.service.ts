import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export interface UserEventPayload {
    event_type: 'user.created' | 'user.updated' | 'user.deleted' | 'preferences.updated';
    user_id: string;
    email: string;
    push_token?: string;
    preferences?: {
        email: boolean;
        push: boolean;
    };
    timestamp: string;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private readonly rabbitmqUrl: string;

    // Exchange and Queue names
    private readonly EXCHANGE = 'notifications.direct';
    private readonly USER_EVENTS_QUEUE = 'user.events';
    private readonly EMAIL_QUEUE = 'email.queue';
    private readonly PUSH_QUEUE = 'push.queue';

    constructor(private configService: ConfigService) {
        this.rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL', '');
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            this.logger.log('Connecting to RabbitMQ...');

            this.connection = await amqp.connect(this.rabbitmqUrl, {
                heartbeat: 60,
            });

            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err);
            });

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
            });

            this.channel = await this.connection.createChannel();

            // Set prefetch to 1 for fair dispatch
            await this.channel.prefetch(1);

            // Declare exchange
            await this.channel.assertExchange(this.EXCHANGE, 'direct', {
                durable: true,
            });

            // Declare queues
            await this.channel.assertQueue(this.USER_EVENTS_QUEUE, {
                durable: true,
            });

            this.logger.log('Successfully connected to RabbitMQ');
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ:', error);
            // Retry connection after 5 seconds
            setTimeout(() => this.connect(), 5000);
        }
    }

    private async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log('Disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ:', error);
        }
    }

    async publishUserEvent(payload: UserEventPayload): Promise<boolean> {
        try {
            if (!this.channel) {
                this.logger.error('RabbitMQ channel not initialized');
                return false;
            }

            const message = JSON.stringify(payload);

            const published = this.channel.publish(
                this.EXCHANGE,
                'user.events', // routing key
                Buffer.from(message),
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                    messageId: `${payload.event_type}-${payload.user_id}-${Date.now()}`,
                },
            );

            if (published) {
                this.logger.log(`Published user event: ${payload.event_type} for user ${payload.user_id}`);
            } else {
                this.logger.warn('Failed to publish message - channel buffer full');
            }

            return published;
        } catch (error) {
            this.logger.error('Error publishing user event:', error);
            return false;
        }
    }

    async publishNotificationRequest(
        userId: string,
        notificationType: 'email' | 'push',
        data: any,
    ): Promise<boolean> {
        try {
            if (!this.channel) {
                this.logger.error('RabbitMQ channel not initialized');
                return false;
            }

            const routingKey = notificationType === 'email' ? 'email' : 'push';
            const queue = notificationType === 'email' ? this.EMAIL_QUEUE : this.PUSH_QUEUE;

            const message = JSON.stringify({
                user_id: userId,
                ...data,
                timestamp: new Date().toISOString(),
            });

            const published = this.channel.publish(
                this.EXCHANGE,
                routingKey,
                Buffer.from(message),
                {
                    persistent: true,
                    contentType: 'application/json',
                    timestamp: Date.now(),
                },
            );

            if (published) {
                this.logger.log(`Published ${notificationType} notification for user ${userId}`);
            }

            return published;
        } catch (error) {
            this.logger.error('Error publishing notification request:', error);
            return false;
        }
    }

    async getQueueInfo(queueName: string): Promise<any> {
        try {
            if (!this.channel) {
                return null;
            }

            const queueInfo = await this.channel.checkQueue(queueName);
            return {
                queue: queueName,
                messageCount: queueInfo.messageCount,
                consumerCount: queueInfo.consumerCount,
            };
        } catch (error) {
            this.logger.error(`Error getting queue info for ${queueName}:`, error);
            return null;
        }
    }

    isConnected(): boolean {
        return this.connection !== undefined && this.channel !== undefined;
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.isConnected()) {
                return false;
            }
            await this.channel.checkQueue(this.USER_EVENTS_QUEUE);
            return true;
        } catch (error) {
            return false;
        }
    }
}
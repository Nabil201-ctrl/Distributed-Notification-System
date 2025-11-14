import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      throw new Error('Upstash Redis credentials not configured');
    }

    this.redis = new Redis({
      url,
      token,
    });

    this.logger.log('Connected to Upstash Redis');
  }

  async onModuleDestroy() {
    this.logger.log('RedisService cleanup complete');
  }

  async setNotificationStatus(
    correlationId: string,
    status: any,
    ttlSeconds: number = 604800, // 7 days
  ): Promise<void> {
    try {
      await this.redis.set(
        `notification:${correlationId}`,
        JSON.stringify(status),
        {
          ex: ttlSeconds,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to set notification status: ${error.message}`);
      throw error;
    }
  }

  async getNotificationStatus(correlationId: string): Promise<any> {
    try {
      const data = await this.redis.get(`notification:${correlationId}`);
      return data ? JSON.parse(data as string) : null;
    } catch (error) {
      this.logger.error(`Failed to get notification status: ${error.message}`);
      return null;
    }
  }

  async getAllNotificationsByUser(userId: string): Promise<any[]> {
    try {
      const keys = await this.redis.keys(`notification:*`);
      const notifications: any[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const notification = JSON.parse(data as string);
          if (notification.user_id === userId) {
            notifications.push(notification);
          }
        }
      }

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get user notifications: ${error.message}`);
      return [];
    }
  }

  async getAllNotifications(): Promise<any[]> {
    try {
      const keys = await this.redis.keys(`notification:*`);
      const notifications: any[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          notifications.push(JSON.parse(data as string));
        }
      }

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get all notifications: ${error.message}`);
      return [];
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
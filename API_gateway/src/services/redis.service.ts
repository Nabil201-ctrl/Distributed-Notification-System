import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    console.log('Connected to Upstash Redis');
  }

  async onModuleDestroy() {
    // Upstash Redis uses HTTP; no open connection to close
    console.log('RedisService cleanup complete');
  }

  // Store notification status
  async setNotificationStatus(correlationId: string, status: any): Promise<void> {
    await this.redis.set(`notification:${correlationId}`, JSON.stringify(status), {
      ex: 86400, // expire in 24 hours
    });
  }

  // Get notification status
  async getNotificationStatus(correlationId: string): Promise<any> {
    const data = await this.redis.get(`notification:${correlationId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Simple health check
  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}

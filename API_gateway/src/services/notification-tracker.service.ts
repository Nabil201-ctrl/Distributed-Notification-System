import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { NotificationStatus } from '../interfaces/notification.interface';

@Injectable()
export class NotificationTrackerService {
  constructor(private readonly redisService: RedisService) {}

  // Generate unique correlation ID
  generateCorrelationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Record notification when it's queued
  async recordNotificationQueued(
    correlationId: string, 
    type: 'email' | 'push', 
    userId: string
  ): Promise<void> {
    const status: NotificationStatus = {
      correlation_id: correlationId,
      status: 'queued',
      type: type,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.redisService.setNotificationStatus(correlationId, status);
  }

  // Get notification status by correlation ID
  async getNotificationStatus(correlationId: string): Promise<NotificationStatus | null> {
    return await this.redisService.getNotificationStatus(correlationId);
  }

  // Update notification status (called by other services via HTTP)
  async updateNotificationStatus(
    correlationId: string, 
    status: 'processing' | 'sent' | 'failed'
  ): Promise<void> {
    const existing = await this.getNotificationStatus(correlationId);
    
    if (existing) {
      const updated: NotificationStatus = {
        ...existing,
        status: status,
        updated_at: new Date().toISOString()
      };

      await this.redisService.setNotificationStatus(correlationId, updated);
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import type { NotificationStatus } from '../interfaces/notification.interface';

@Injectable()
export class NotificationTrackerService {
  private readonly logger = new Logger(NotificationTrackerService.name);

  constructor(private readonly redisService: RedisService) { }

  generateCorrelationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async recordNotificationQueued(
    correlationId: string,
    type: 'email' | 'push',
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const status: NotificationStatus = {
      correlation_id: correlationId,
      status: 'queued',
      type: type,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retry_count: 0,
      metadata: metadata || {},
    };

    await this.redisService.setNotificationStatus(correlationId, status);
    this.logger.log(`Recorded notification ${correlationId} as queued`);
  }

  async getNotificationStatus(
    correlationId: string,
  ): Promise<NotificationStatus | null> {
    return await this.redisService.getNotificationStatus(correlationId);
  }

  async updateNotificationStatus(
    correlationId: string,
    status: 'processing' | 'sent' | 'failed' | 'bounced',
    errorMessage?: string,
  ): Promise<void> {
    const existing = await this.getNotificationStatus(correlationId);

    if (existing) {
      const updated: NotificationStatus = {
        ...existing,
        status: status,
        updated_at: new Date().toISOString(),
        ...(status === 'sent' && { sent_at: new Date().toISOString() }),
        ...(errorMessage && { error_message: errorMessage }),
      };

      await this.redisService.setNotificationStatus(correlationId, updated);
      this.logger.log(`Updated notification ${correlationId} to ${status}`);
    }
  }

  async incrementRetryCount(correlationId: string): Promise<number> {
    const existing = await this.getNotificationStatus(correlationId);

    if (existing) {
      existing.retry_count = (existing.retry_count || 0) + 1;
      existing.updated_at = new Date().toISOString();
      await this.redisService.setNotificationStatus(correlationId, existing);
      return existing.retry_count;
    }

    return 0;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: NotificationStatus[]; meta: any }> {
    const allNotifications = await this.redisService.getAllNotificationsByUser(
      userId,
    );

    // Sort by created_at (newest first)
    allNotifications.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Paginate
    const start = (page - 1) * limit;
    const paginatedNotifications = allNotifications.slice(start, start + limit);

    return {
      data: paginatedNotifications,
      meta: {
        total: allNotifications.length,
        page,
        limit,
        total_pages: Math.ceil(allNotifications.length / limit),
        has_next: page * limit < allNotifications.length,
        has_previous: page > 1,
      },
    };
  }

  async getStatistics(): Promise<any> {
    try {
      const allNotifications = await this.redisService.getAllNotifications();

      const stats = {
        total: allNotifications.length,
        queued: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        bounced: 0,
        email: 0,
        push: 0,
      };

      allNotifications.forEach((notification) => {
        if (notification.status) {
          stats[notification.status]++;
        }
        if (notification.type) {
          stats[notification.type]++;
        }
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to get statistics:', error);
      return null;
    }
  }
}
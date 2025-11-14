import { Injectable } from '@nestjs/common';
import { TemplateService } from '../template/template.service';
import * as amqp from 'amqplib';

@Injectable()
export class TemplateHealthService {
  constructor(private readonly templateService: TemplateService) {}

  async checkHealth() {
    const result: {
      status: 'healthy' | 'unhealthy';
      timestamp: string;
      services: {
        database: { status: string; error?: string };
        rabbitmq: { status: string; error?: string };
      };
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown' },
        rabbitmq: { status: 'unknown' },
      },
    };

    try {
      await this.templateService.findAll();
      result.services.database.status = 'up';
    } catch (error: any) {
      result.status = 'unhealthy';
      result.services.database.status = 'down';
      result.services.database.error = error.message;
    }

    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      await connection.close();
      result.services.rabbitmq.status = 'up';
    } catch (error: any) {
      result.status = 'unhealthy';
      result.services.rabbitmq.status = 'down';
      result.services.rabbitmq.error = error.message;
    }

    return result;
  }

  async readiness() {
    const dbHealthy = await this.templateService.findAll().then(() => true).catch(() => false);
    const rabbitHealthy = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672')
      .then((conn) => conn.close().then(() => true))
      .catch(() => false);

    const isReady = dbHealthy && rabbitHealthy;

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbHealthy ? 'connected' : 'disconnected',
        rabbitmq: rabbitHealthy ? 'connected' : 'disconnected',
      },
    };
  }

  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }
}

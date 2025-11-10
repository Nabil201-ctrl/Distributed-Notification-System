import { Controller, Get } from '@nestjs/common';
import { RabbitMQService } from '../services/rabbitmq.service';
import { RedisService } from '../services/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async checkHealth() {
    const rabbitmqHealthy = this.rabbitMQService.isHealthy();
    const redisHealthy = await this.redisService.isHealthy();

    const status = rabbitmqHealthy && redisHealthy ? 'healthy' : 'unhealthy';

    return {
      status: status,
      timestamp: new Date().toISOString(),
      services: {
        rabbitmq: rabbitmqHealthy,
        redis: redisHealthy
      }
    };
  }
}

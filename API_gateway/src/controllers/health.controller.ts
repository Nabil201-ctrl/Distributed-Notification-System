import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RabbitMQService } from '../services/rabbitmq.service';
import { RedisService } from '../services/redis.service';
import { HealthStatusResponseDto } from '../dto/health-status-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check downstream service health' })
  @ApiOkResponse({
    description: 'RabbitMQ and Redis health status',
    type: HealthStatusResponseDto
  })
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

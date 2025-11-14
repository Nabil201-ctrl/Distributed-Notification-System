import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RabbitMQService } from '../services/rabbitmq.service';
import { RedisService } from '../services/redis.service';
import { UserServiceClient } from '../services/user-service-client.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { HealthStatusResponseDto } from '../dto/health-status-response.dto';

@ApiTags('health')
@Controller('health')
@UseGuards(JwtAuthGuard)
export class HealthController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisService: RedisService,
    private readonly userServiceClient: UserServiceClient,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check overall service health' })
  @ApiOkResponse({
    description: 'Service health status with all dependencies',
    type: HealthStatusResponseDto,
  })
  async checkHealth() {
    const startTime = Date.now();

    const rabbitmqHealthy = await this.rabbitMQService.healthCheck();
    const rabbitmqResponseTime = Date.now() - startTime;

    const redisStart = Date.now();
    const redisHealthy = await this.redisService.isHealthy();
    const redisResponseTime = Date.now() - redisStart;

    const userServiceStart = Date.now();
    const userServiceHealthy = await this.userServiceClient.healthCheck();
    const userServiceResponseTime = Date.now() - userServiceStart;

    const allHealthy = rabbitmqHealthy && redisHealthy;

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        rabbitmq: {
          status: rabbitmqHealthy ? 'up' : 'down',
          responseTime: rabbitmqResponseTime,
        },
        redis: {
          status: redisHealthy ? 'up' : 'down',
          responseTime: redisResponseTime,
        },
        user_service: {
          status: userServiceHealthy ? 'up' : 'down',
          responseTime: userServiceResponseTime,
        },
      },
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiOkResponse({
    description: 'Service is ready to accept traffic',
  })
  async readiness() {
    const rabbitmqHealthy = await this.rabbitMQService.healthCheck();
    const redisHealthy = await this.redisService.isHealthy();

    const isReady = rabbitmqHealthy && redisHealthy;

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        rabbitmq: rabbitmqHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    };
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiOkResponse({
    description: 'Service is alive',
  })
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

  @Get('circuit-breakers')
  @ApiOperation({ summary: 'Get circuit breaker status (Admin only)' })
  @ApiOkResponse({
    description: 'Circuit breaker statistics',
  })
  async getCircuitBreakers(@CurrentUser() user: any) {
    if (user?.role !== 'admin') {
      return {
        success: false,
        error: 'Access denied',
        message: 'Admin role required',
      };
    }

    const stats = this.circuitBreakerService.getAllStats();
    return {
      success: true,
      data: stats,
      message: 'Circuit breaker stats retrieved',
    };
  }

  @Get('queues')
  @ApiOperation({ summary: 'Get RabbitMQ queue statistics (Admin only)' })
  @ApiOkResponse({
    description: 'Queue statistics',
  })
  async getQueueStats(@CurrentUser() user: any) {
    if (user?.role !== 'admin') {
      return {
        success: false,
        error: 'Access denied',
        message: 'Admin role required',
      };
    }

    try {
      const queueStats = await this.rabbitMQService.getQueueStats();

      if (!queueStats) {
        return {
          success: false,
          error: 'Unable to retrieve queue stats',
          message: 'RabbitMQ may not be connected',
        };
      }

      return {
        success: true,
        data: queueStats,
        message: 'Queue stats retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve queue stats',
      };
    }
  }
}
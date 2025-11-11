import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';
import { UpstashRedisService } from '../cache/upstash-redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private redisService: UpstashRedisService,
        private rabbitMQService: RabbitMQService,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check service health status' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    @ApiResponse({ status: 503, description: 'Service is unhealthy' })
    async check() {
        return this.health.check([
            // Check database connection
            () => this.db.pingCheck('database'),
            // Check memory usage (heap should not exceed 150MB)
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            // Check RSS memory (should not exceed 300MB)
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
            // Check Redis connection
            async () => {
                const isHealthy = await this.redisService.ping();
                return {
                    redis: {
                        status: isHealthy ? 'up' : 'down',
                    },
                };
            },
            // Check RabbitMQ connection
            async () => {
                const isHealthy = await this.rabbitMQService.healthCheck();
                return {
                    rabbitmq: {
                        status: isHealthy ? 'up' : 'down',
                    },
                };
            },
        ]);
    }

    @Get('ready')
    @ApiOperation({ summary: 'Check if service is ready to accept traffic' })
    @ApiResponse({ status: 200, description: 'Service is ready' })
    async readiness() {
        const redisHealthy = await this.redisService.ping();
        const rabbitMQHealthy = await this.rabbitMQService.healthCheck();

        return {
            status: redisHealthy && rabbitMQHealthy ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
            service: 'user-service',
            version: process.env.npm_package_version || '1.0.0',
            dependencies: {
                redis: redisHealthy ? 'connected' : 'disconnected',
                rabbitmq: rabbitMQHealthy ? 'connected' : 'disconnected',
            },
        };
    }

    @Get('live')
    @ApiOperation({ summary: 'Check if service is alive' })
    @ApiResponse({ status: 200, description: 'Service is alive' })
    async liveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
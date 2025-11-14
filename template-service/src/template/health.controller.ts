import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { TemplateHealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class TemplateHealthController {
    constructor(private readonly healthService: TemplateHealthService) { }

    @Get()
    @ApiOperation({ summary: 'Check if the template service and RabbitMQ are healthy' })
    @ApiOkResponse({ description: 'Service health status' })
    async checkHealth() {
        return this.healthService.checkHealth();
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
    @ApiOkResponse({ description: 'Service is ready to accept traffic' })
    async readiness() {
        return this.healthService.readiness();
    }

    @Get('live')
    @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
    @ApiOkResponse({ description: 'Service is alive' })
    async liveness() {
        return this.healthService.liveness();
    }
}

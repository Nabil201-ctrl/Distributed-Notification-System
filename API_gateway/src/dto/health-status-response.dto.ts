import { ApiProperty } from '@nestjs/swagger';

class HealthServicesStatusDto {
  @ApiProperty({ description: 'Indicates whether RabbitMQ is reachable' })
  rabbitmq: boolean;

  @ApiProperty({ description: 'Indicates whether Redis is reachable' })
  redis: boolean;
}

export class HealthStatusResponseDto {
  @ApiProperty({ enum: ['healthy', 'unhealthy'] })
  status: 'healthy' | 'unhealthy';

  @ApiProperty({ description: 'ISO timestamp of when the health check was performed' })
  timestamp: string;

  @ApiProperty({ type: () => HealthServicesStatusDto })
  services: HealthServicesStatusDto;
}

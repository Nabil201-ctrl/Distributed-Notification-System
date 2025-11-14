import { ApiProperty } from '@nestjs/swagger';

class ServiceHealth {
  @ApiProperty({ example: 'up' })
  status: string;

  @ApiProperty({ example: 123 })
  responseTime?: number;
}

export class HealthStatusResponseDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 12345.67 })
  uptime: number;

  @ApiProperty({
    example: {
      rabbitmq: { status: 'up', responseTime: 45 },
      redis: { status: 'up', responseTime: 23 },
      user_service: { status: 'up', responseTime: 150 },
    },
  })
  services: {
    rabbitmq: ServiceHealth;
    redis: ServiceHealth;
    user_service: ServiceHealth;
  };
}
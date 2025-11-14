import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { NotificationController } from './controllers/notification.controller';
import { HealthController } from './controllers/health.controller';
import { RabbitMQService } from './services/rabbitmq.service';
import { RedisService } from './services/redis.service';
import { NotificationTrackerService } from './services/notification-tracker.service';
import { UserServiceClient } from './services/user-service-client.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [NotificationController, HealthController],
  providers: [
    RabbitMQService,
    RedisService,
    NotificationTrackerService,
    UserServiceClient,
    CircuitBreakerService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
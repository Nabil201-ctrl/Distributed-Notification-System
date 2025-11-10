import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './controllers/notification.controller';
import { HealthController } from './controllers/health.controller';
import { RabbitMQService } from './services/rabbitmq.service';
import { RedisService } from './services/redis.service';
import { NotificationTrackerService } from './services/notification-tracker.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [NotificationController, HealthController],
  providers: [RabbitMQService, RedisService, NotificationTrackerService],
})
export class AppModule {}
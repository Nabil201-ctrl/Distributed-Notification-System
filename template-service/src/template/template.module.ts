import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';

@Module({
  imports: [
    // TypeORM entities for templates and their version history
    TypeOrmModule.forFeature([Template, TemplateHistory]),

    // RabbitMQ client for publishing template events
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'template_events_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [TemplateController], // Handles REST endpoints for templates
  providers: [TemplateService],       // Business logic for templates
  exports: [TemplateService],         // Allows other modules to use TemplateService
})
export class TemplateModule {}

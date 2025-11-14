import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';

@Module({
  imports: [
    
    TypeOrmModule.forFeature([Template, TemplateHistory]),

    
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
  controllers: [TemplateController], 
  providers: [TemplateService],       
  exports: [TemplateService],         
})
export class TemplateModule {}

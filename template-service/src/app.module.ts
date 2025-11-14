import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemplateModule } from './template/template.module';
import { Template } from './template/entities/template.entity';
import { TemplateHistory } from './template/entities/template-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Template, TemplateHistory],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          exchange: process.env.RABBITMQ_TEMPLATE_EXCHANGE || 'template.events',
          exchangeType: process.env.RABBITMQ_TEMPLATE_EXCHANGE_TYPE as any || 'topic',
          queue: '',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),

    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

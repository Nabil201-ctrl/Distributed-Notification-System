import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EmailProcessorService } from '../services/email-processor.service';
import { TemplateClientService } from '../services/template-client.service';
import { UserClientService } from '../services/user-client.service';
import { MailerService } from '../services/mailer.service';
import { NotificationStatusService } from '../services/notification-status.service';
import { HealthController } from '../controllers/health.controller';
import { TestEmailController } from '../controllers/test-email.controller';
import { EmailLogService } from '../services/email-log.service';
import { EmailsController } from '../controllers/emails.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController, TestEmailController, EmailsController],
  providers: [
    EmailProcessorService,
    TemplateClientService,
    UserClientService,
    MailerService,
    NotificationStatusService,
    EmailLogService,
  ],
})
export class EmailModule {}

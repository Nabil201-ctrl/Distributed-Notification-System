import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateService } from './template.service';
import { TemplateHealthService } from './health.service';
import { TemplateHealthController } from './health.controller';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template, TemplateHistory])],
  providers: [TemplateService, TemplateHealthService],
  controllers: [TemplateHealthController],
  exports: [TemplateHealthService],
})
export class TemplateModule {}

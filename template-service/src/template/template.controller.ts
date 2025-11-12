import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTemplateDto: CreateTemplateDto): Promise<Template> {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  findAll(): Promise<Template[]> {
    return this.templateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Template> {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.templateService.remove(id);
  }

  @Get(':id/history')
  findHistory(@Param('id') id: string): Promise<TemplateHistory[]> {
    return this.templateService.findHistory(id);
  }
}

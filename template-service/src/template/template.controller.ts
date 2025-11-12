import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';

@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a notification template' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Template created successfully', type: Template })
  @ApiResponse({
    status: 409,
    description: 'Template name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Template name "welcome_email" already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createTemplateDto: CreateTemplateDto): Promise<Template> {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all templates' })
  @ApiResponse({ status: 200, description: 'Array of templates', type: Template, isArray: true })
  findAll(): Promise<Template[]> {
    return this.templateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template found', type: Template })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string): Promise<Template> {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Template updated', type: Template })
  @ApiResponse({
    status: 409,
    description: 'Template name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Template name "welcome_email" already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.templateService.remove(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get template version history' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'History entries', type: TemplateHistory, isArray: true })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findHistory(@Param('id') id: string): Promise<TemplateHistory[]> {
    return this.templateService.findHistory(id);
  }
}

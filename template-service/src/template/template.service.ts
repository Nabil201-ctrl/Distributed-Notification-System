import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(TemplateHistory)
    private readonly templateHistoryRepository: Repository<TemplateHistory>,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    const template = this.templateRepository.create(createTemplateDto);
    const savedTemplate = await this.templateRepository.save(template);
    // Optionally, publish an event to RabbitMQ
    this.client.emit('template.created', savedTemplate);
    return savedTemplate;
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }
    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    const existingTemplate = await this.templateRepository.findOne({ where: { id } });
    if (!existingTemplate) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    // Save current version to history before updating
    const historyEntry = this.templateHistoryRepository.create({
      templateId: existingTemplate.id,
      name: existingTemplate.name,
      type: existingTemplate.type,
      body: existingTemplate.body,
      variables: existingTemplate.variables,
    });
    await this.templateHistoryRepository.save(historyEntry);

    // Update the template
    const updatedTemplate = await this.templateRepository.save({
      ...existingTemplate,
      ...updateTemplateDto,
    });

    // Optionally, publish an event to RabbitMQ
    this.client.emit('template.updated', updatedTemplate);
    return updatedTemplate;
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }
    // Optionally, publish an event to RabbitMQ
    this.client.emit('template.deleted', { id });
  }

  async findHistory(templateId: string): Promise<TemplateHistory[]> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }
    return this.templateHistoryRepository.find({ where: { templateId }, order: { versionedAt: 'DESC' } });
  }
}

import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
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
  ) { }

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    const template = this.templateRepository.create(createTemplateDto);
    try {
      const savedTemplate = await this.templateRepository.save(template);
      
      this.client.emit('template.created', savedTemplate);
      return savedTemplate;
    } catch (error) {
      this.handleUniqueConstraintError(error, createTemplateDto.name);
    }
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async findByName(name: string): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { name } });
    if (!template) {
      throw new NotFoundException(`Template with name "${name}" not found`);
    }
    return template;
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

    if (updateTemplateDto.name && updateTemplateDto.name !== existingTemplate.name) {
      const conflictingTemplate = await this.templateRepository.findOne({
        where: { name: updateTemplateDto.name },
      });
      if (conflictingTemplate) {
        throw new ConflictException(`Template name "${updateTemplateDto.name}" already exists`);
      }
    }

    
    const historyEntry = this.templateHistoryRepository.create({
      templateId: existingTemplate.id,
      name: existingTemplate.name,
      type: existingTemplate.type,
      body: existingTemplate.body,
      variables: existingTemplate.variables,
    });
    await this.templateHistoryRepository.save(historyEntry);

    
    try {
      const updatedTemplate = await this.templateRepository.save({
        ...existingTemplate,
        ...updateTemplateDto,
      });

      
      this.client.emit('template.updated', updatedTemplate);
      return updatedTemplate;
    } catch (error) {
      this.handleUniqueConstraintError(error, updateTemplateDto.name ?? existingTemplate.name);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }
    
    this.client.emit('template.deleted', { id });
  }

  async findHistory(templateId: string): Promise<TemplateHistory[]> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }
    return this.templateHistoryRepository.find({ where: { templateId }, order: { versionedAt: 'DESC' } });
  }

  private handleUniqueConstraintError(error: unknown, templateName: string): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      if (driverError?.code === '23505') {
        throw new ConflictException(`Template name "${templateName}" already exists`);
      }
    }
    throw error;
  }
}

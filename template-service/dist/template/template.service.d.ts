import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ClientProxy } from '@nestjs/microservices';
export declare class TemplateService {
    private readonly templateRepository;
    private readonly templateHistoryRepository;
    private readonly client;
    constructor(templateRepository: Repository<Template>, templateHistoryRepository: Repository<TemplateHistory>, client: ClientProxy);
    create(createTemplateDto: CreateTemplateDto): Promise<Template>;
    findAll(): Promise<Template[]>;
    findOne(id: string): Promise<Template>;
    update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template>;
    remove(id: string): Promise<void>;
    findHistory(templateId: string): Promise<TemplateHistory[]>;
    private handleUniqueConstraintError;
}

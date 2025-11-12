import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { TemplateHistory } from './entities/template-history.entity';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
    create(createTemplateDto: CreateTemplateDto): Promise<Template>;
    findAll(): Promise<Template[]>;
    findOne(id: string): Promise<Template>;
    update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template>;
    remove(id: string): Promise<void>;
    findHistory(id: string): Promise<TemplateHistory[]>;
}

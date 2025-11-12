"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const template_entity_1 = require("./entities/template.entity");
const template_history_entity_1 = require("./entities/template-history.entity");
const microservices_1 = require("@nestjs/microservices");
let TemplateService = class TemplateService {
    templateRepository;
    templateHistoryRepository;
    client;
    constructor(templateRepository, templateHistoryRepository, client) {
        this.templateRepository = templateRepository;
        this.templateHistoryRepository = templateHistoryRepository;
        this.client = client;
    }
    async create(createTemplateDto) {
        const template = this.templateRepository.create(createTemplateDto);
        const savedTemplate = await this.templateRepository.save(template);
        this.client.emit('template.created', savedTemplate);
        return savedTemplate;
    }
    async findAll() {
        return this.templateRepository.find();
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        return template;
    }
    async update(id, updateTemplateDto) {
        const existingTemplate = await this.templateRepository.findOne({ where: { id } });
        if (!existingTemplate) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        const historyEntry = this.templateHistoryRepository.create({
            templateId: existingTemplate.id,
            name: existingTemplate.name,
            type: existingTemplate.type,
            body: existingTemplate.body,
            variables: existingTemplate.variables,
        });
        await this.templateHistoryRepository.save(historyEntry);
        const updatedTemplate = await this.templateRepository.save({
            ...existingTemplate,
            ...updateTemplateDto,
        });
        this.client.emit('template.updated', updatedTemplate);
        return updatedTemplate;
    }
    async remove(id) {
        const result = await this.templateRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        this.client.emit('template.deleted', { id });
    }
    async findHistory(templateId) {
        const template = await this.templateRepository.findOne({ where: { id: templateId } });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${templateId}" not found`);
        }
        return this.templateHistoryRepository.find({ where: { templateId }, order: { versionedAt: 'DESC' } });
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __param(1, (0, typeorm_1.InjectRepository)(template_history_entity_1.TemplateHistory)),
    __param(2, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        microservices_1.ClientProxy])
], TemplateService);
//# sourceMappingURL=template.service.js.map
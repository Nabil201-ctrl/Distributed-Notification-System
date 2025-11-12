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
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const template_service_1 = require("./template.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_template_dto_1 = require("./dto/update-template.dto");
const template_entity_1 = require("./entities/template.entity");
const template_history_entity_1 = require("./entities/template-history.entity");
let TemplateController = class TemplateController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    create(createTemplateDto) {
        return this.templateService.create(createTemplateDto);
    }
    findAll() {
        return this.templateService.findAll();
    }
    findOne(id) {
        return this.templateService.findOne(id);
    }
    update(id, updateTemplateDto) {
        return this.templateService.update(id, updateTemplateDto);
    }
    remove(id) {
        return this.templateService.remove(id);
    }
    findHistory(id) {
        return this.templateService.findHistory(id);
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a notification template' }),
    (0, swagger_1.ApiBody)({ type: create_template_dto_1.CreateTemplateDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully', type: template_entity_1.Template }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Template name already exists',
        schema: {
            example: {
                statusCode: 409,
                message: 'Template name "welcome_email" already exists',
                error: 'Conflict',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of templates', type: template_entity_1.Template, isArray: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a template by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template found', type: template_entity_1.Template }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a template' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template UUID' }),
    (0, swagger_1.ApiBody)({ type: update_template_dto_1.UpdateTemplateDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template updated', type: template_entity_1.Template }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Template name already exists',
        schema: {
            example: {
                statusCode: 409,
                message: 'Template name "welcome_email" already exists',
                error: 'Conflict',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a template' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template UUID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Template deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template version history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Template UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'History entries', type: template_history_entity_1.TemplateHistory, isArray: true }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "findHistory", null);
exports.TemplateController = TemplateController = __decorate([
    (0, swagger_1.ApiTags)('Templates'),
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [template_service_1.TemplateService])
], TemplateController);
//# sourceMappingURL=template.controller.js.map
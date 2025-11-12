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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateHistory = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const template_entity_1 = require("./template.entity");
let TemplateHistory = class TemplateHistory {
    id;
    template;
    templateId;
    name;
    type;
    body;
    variables;
    versionedAt;
};
exports.TemplateHistory = TemplateHistory;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the history entry' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TemplateHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_entity_1.Template, template => template.history),
    __metadata("design:type", template_entity_1.Template)
], TemplateHistory.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the template ID', example: '433aaf14-1f39-44cc-a48d-1cc779204081' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'welcome_email' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'email' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '<p>Hello {{name}}, welcome aboard!</p>' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'object',
        example: { name: 'Ada', product: 'Beta release' },
        additionalProperties: { type: 'string' }
    }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TemplateHistory.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When this version was created', example: '2025-11-12T09:11:06.010Z' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TemplateHistory.prototype, "versionedAt", void 0);
exports.TemplateHistory = TemplateHistory = __decorate([
    (0, typeorm_1.Entity)('template_history')
], TemplateHistory);
//# sourceMappingURL=template-history.entity.js.map
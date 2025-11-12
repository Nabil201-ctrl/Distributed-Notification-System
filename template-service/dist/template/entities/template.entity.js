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
exports.Template = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const template_history_entity_1 = require("./template-history.entity");
let Template = class Template {
    id;
    name;
    type;
    body;
    variables;
    createdAt;
    updatedAt;
    history;
};
exports.Template = Template;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the template', example: '433aaf14-1f39-44cc-a48d-1cc779204081' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Template.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human readable unique name for the template', example: 'welcome_email' }),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Template.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel type such as email, sms or push', example: 'email' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Template.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Template body that supports placeholder variables',
        example: '<p>Hello {{name}}, welcome aboard!</p>',
    }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Template.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JSON object describing variables embedded in the template',
        example: { name: 'Ada', product: 'ALPHA release' },
        type: 'object',
        additionalProperties: { type: 'string' }
    }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Template.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp', example: '2025-11-12T09:11:06.010Z' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Template.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time the template was last updated', example: '2025-11-12T09:11:06.010Z' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Template.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => template_history_entity_1.TemplateHistory, history => history.template),
    __metadata("design:type", Array)
], Template.prototype, "history", void 0);
exports.Template = Template = __decorate([
    (0, typeorm_1.Entity)('templates')
], Template);
//# sourceMappingURL=template.entity.js.map
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
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TemplateHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_entity_1.Template, template => template.history),
    __metadata("design:type", template_entity_1.Template)
], TemplateHistory.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateHistory.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TemplateHistory.prototype, "variables", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TemplateHistory.prototype, "versionedAt", void 0);
exports.TemplateHistory = TemplateHistory = __decorate([
    (0, typeorm_1.Entity)('template_history')
], TemplateHistory);
//# sourceMappingURL=template-history.entity.js.map
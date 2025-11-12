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
exports.TestEmailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TestEmailDto {
    user_id;
    template_id;
    type = 'email';
    variables;
    timestamp;
}
exports.TestEmailDto = TestEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User id to lookup contact info', example: 'user-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestEmailDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template id to render', example: 'template-uuid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestEmailDto.prototype, "template_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['email'], default: 'email' }),
    (0, class_validator_1.IsEnum)(['email']),
    __metadata("design:type", String)
], TestEmailDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Variables passed to template rendering',
        example: { name: 'Njay', product: 'Alpha' },
        type: 'object',
        additionalProperties: { type: 'string' },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestEmailDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ISO timestamp', example: '2025-11-12T09:11:06.010Z' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestEmailDto.prototype, "timestamp", void 0);
//# sourceMappingURL=test-email.dto.js.map
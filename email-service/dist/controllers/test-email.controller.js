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
exports.TestEmailController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_processor_service_1 = require("../services/email-processor.service");
const test_email_dto_1 = require("../dto/test-email.dto");
let TestEmailController = class TestEmailController {
    emailProcessor;
    constructor(emailProcessor) {
        this.emailProcessor = emailProcessor;
    }
    async testSend(payload) {
        const messageId = await this.emailProcessor.processPayload({
            ...payload,
            type: 'email',
        });
        return { success: true, message: 'Email processed', data: { messageId } };
    }
};
exports.TestEmailController = TestEmailController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger an email send without queue (testing only)' }),
    (0, swagger_1.ApiBody)({ type: test_email_dto_1.TestEmailDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Email processed successfully',
        schema: {
            example: {
                success: true,
                message: 'Email processed',
                data: {
                    messageId: 'email_1731378000000_c5cf0505',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_email_dto_1.TestEmailDto]),
    __metadata("design:returntype", Promise)
], TestEmailController.prototype, "testSend", null);
exports.TestEmailController = TestEmailController = __decorate([
    (0, swagger_1.ApiTags)('Test'),
    (0, common_1.Controller)('test'),
    __metadata("design:paramtypes", [email_processor_service_1.EmailProcessorService])
], TestEmailController);
//# sourceMappingURL=test-email.controller.js.map
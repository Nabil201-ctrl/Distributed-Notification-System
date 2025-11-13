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
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_log_service_1 = require("../services/email-log.service");
const email_log_response_dto_1 = require("../dto/email-log-response.dto");
let EmailsController = class EmailsController {
    emailLogService;
    constructor(emailLogService) {
        this.emailLogService = emailLogService;
    }
    getEmailByMessageId(messageId) {
        const record = this.emailLogService.get(messageId);
        if (!record) {
            throw new common_1.NotFoundException(`Email with message id "${messageId}" not found`);
        }
        return record;
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)(':messageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve email delivery details by message id' }),
    (0, swagger_1.ApiParam)({ name: 'messageId', description: 'Unique email message identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Email details found', type: email_log_response_dto_1.EmailLogResponseDto }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'No email found for provided id' }),
    __param(0, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", email_log_response_dto_1.EmailLogResponseDto)
], EmailsController.prototype, "getEmailByMessageId", null);
exports.EmailsController = EmailsController = __decorate([
    (0, swagger_1.ApiTags)('Emails'),
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [email_log_service_1.EmailLogService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map
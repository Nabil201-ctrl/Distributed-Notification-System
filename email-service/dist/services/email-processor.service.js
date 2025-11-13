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
var EmailProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessorService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const template_client_service_1 = require("./template-client.service");
const user_client_service_1 = require("./user-client.service");
const mailer_service_1 = require("./mailer.service");
const notification_status_service_1 = require("./notification-status.service");
const email_log_service_1 = require("./email-log.service");
let EmailProcessorService = EmailProcessorService_1 = class EmailProcessorService {
    templateClient;
    userClient;
    mailer;
    statusService;
    emailLogService;
    logger = new common_1.Logger(EmailProcessorService_1.name);
    constructor(templateClient, userClient, mailer, statusService, emailLogService) {
        this.templateClient = templateClient;
        this.userClient = userClient;
        this.mailer = mailer;
        this.statusService = statusService;
        this.emailLogService = emailLogService;
    }
    async handleQueueMessage(payload, context) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            await this.processPayload(payload);
            channel.ack(originalMsg);
        }
        catch (error) {
            this.logger.error(`Failed to process ${payload.correlation_id}: ${error.message}`);
            await this.statusService.updateStatus(payload.correlation_id, 'failed');
            channel.nack(originalMsg, false, false);
        }
    }
    async processPayload(payload) {
        this.logger.log(`Processing ${payload.correlation_id ?? 'n/a'}`);
        await this.statusService.updateStatus(payload.correlation_id, 'processing');
        const [template, contactInfo] = await Promise.all([
            this.templateClient.getTemplate(payload.template_id),
            this.userClient.getContactInfo(payload.user_id),
        ]);
        if (!contactInfo.preferences.email) {
            this.logger.warn(`User ${payload.user_id} opted out of email notifications`);
            await this.statusService.updateStatus(payload.correlation_id, 'failed');
            return;
        }
        const rendered = this.renderTemplate(template.body, payload.variables);
        const { messageId } = await this.mailer.sendEmail({
            to: contactInfo.email,
            subject: template['subject'] ?? template.name,
            html: rendered,
        });
        this.emailLogService.record({
            messageId,
            userId: payload.user_id,
            templateId: payload.template_id,
            to: contactInfo.email,
            subject: template['subject'] ?? template.name,
            variables: payload.variables,
            sentAt: new Date().toISOString(),
        });
        await this.statusService.updateStatus(payload.correlation_id, 'sent');
        return messageId;
    }
    renderTemplate(body, variables) {
        return body.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
            const value = this.deepGet(variables, key);
            return value ?? '';
        });
    }
    deepGet(source, path) {
        return path.split('.').reduce((acc, segment) => (acc ? acc[segment] : undefined), source);
    }
};
exports.EmailProcessorService = EmailProcessorService;
__decorate([
    (0, microservices_1.EventPattern)('email'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], EmailProcessorService.prototype, "handleQueueMessage", null);
exports.EmailProcessorService = EmailProcessorService = EmailProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [template_client_service_1.TemplateClientService,
        user_client_service_1.UserClientService,
        mailer_service_1.MailerService,
        notification_status_service_1.NotificationStatusService,
        email_log_service_1.EmailLogService])
], EmailProcessorService);
//# sourceMappingURL=email-processor.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const email_processor_service_1 = require("../services/email-processor.service");
const template_client_service_1 = require("../services/template-client.service");
const user_client_service_1 = require("../services/user-client.service");
const mailer_service_1 = require("../services/mailer.service");
const notification_status_service_1 = require("../services/notification-status.service");
const health_controller_1 = require("../controllers/health.controller");
const test_email_controller_1 = require("../controllers/test-email.controller");
const email_log_service_1 = require("../services/email-log.service");
const emails_controller_1 = require("../controllers/emails.controller");
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
        ],
        controllers: [health_controller_1.HealthController, test_email_controller_1.TestEmailController, emails_controller_1.EmailsController],
        providers: [
            email_processor_service_1.EmailProcessorService,
            template_client_service_1.TemplateClientService,
            user_client_service_1.UserClientService,
            mailer_service_1.MailerService,
            notification_status_service_1.NotificationStatusService,
            email_log_service_1.EmailLogService,
        ],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map
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
var NotificationStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatusService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let NotificationStatusService = NotificationStatusService_1 = class NotificationStatusService {
    http;
    config;
    logger = new common_1.Logger(NotificationStatusService_1.name);
    gatewayUrl;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.gatewayUrl = this.config.get('API_GATEWAY_URL', 'http://localhost:3000');
    }
    async updateStatus(correlationId, status) {
        if (!correlationId) {
            return;
        }
        try {
            await this.http.axiosRef.patch(`${this.gatewayUrl}/status/${correlationId}`, { status }, {
                headers: this.buildAuthHeader(),
            });
        }
        catch (error) {
            this.logger.warn(`Failed to update status for ${correlationId}: ${error.message}`);
        }
    }
    buildAuthHeader() {
        const token = this.config.get('SERVICE_AUTH_TOKEN');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }
};
exports.NotificationStatusService = NotificationStatusService;
exports.NotificationStatusService = NotificationStatusService = NotificationStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], NotificationStatusService);
//# sourceMappingURL=notification-status.service.js.map
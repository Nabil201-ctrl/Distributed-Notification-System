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
var UserClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserClientService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let UserClientService = UserClientService_1 = class UserClientService {
    http;
    config;
    logger = new common_1.Logger(UserClientService_1.name);
    baseUrl;
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.baseUrl = this.config.get('USER_SERVICE_URL', 'https://user-service-giq0.onrender.com/');
    }
    async getContactInfo(userId) {
        try {
            const { data } = await this.http.axiosRef.get(`${this.baseUrl}/api/v1/users/${userId}/contact-info`, {
                headers: this.buildAuthHeader(),
            });
            return data.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch contact info for user ${userId}: ${error.message}`);
            throw error;
        }
    }
    buildAuthHeader() {
        const token = this.config.get('SERVICE_AUTH_TOKEN');
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }
};
exports.UserClientService = UserClientService;
exports.UserClientService = UserClientService = UserClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], UserClientService);
//# sourceMappingURL=user-client.service.js.map
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface UserContactInfo {
    email: string;
    push_token?: string | null;
    preferences: {
        email: boolean;
        push: boolean;
    };
}
export declare class UserClientService {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    getContactInfo(userId: string): Promise<UserContactInfo>;
    private buildAuthHeader;
}

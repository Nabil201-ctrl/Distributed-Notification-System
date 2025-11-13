import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface TemplatePayload {
    id: string;
    name: string;
    type: string;
    body: string;
    variables?: Record<string, any>;
    subject?: string;
}
export declare class TemplateClientService {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    getTemplate(templateId: string): Promise<TemplatePayload>;
    private buildAuthHeader;
}

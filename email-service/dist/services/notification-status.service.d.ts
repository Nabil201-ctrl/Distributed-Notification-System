import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class NotificationStatusService {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly gatewayUrl;
    constructor(http: HttpService, config: ConfigService);
    updateStatus(correlationId: string | undefined, status: 'processing' | 'sent' | 'failed'): Promise<void>;
    private buildAuthHeader;
}

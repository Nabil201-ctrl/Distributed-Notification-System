import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationStatusService {
  private readonly logger = new Logger(NotificationStatusService.name);
  private readonly gatewayUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.gatewayUrl = this.config.get<string>('API_GATEWAY_URL', 'http://localhost:3000');
  }

  async updateStatus(correlationId: string | undefined, status: 'processing' | 'sent' | 'failed') {
    if (!correlationId) {
      return;
    }
    try {
      await this.http.axiosRef.patch(
        `${this.gatewayUrl}/status/${correlationId}`,
        { status },
        {
          headers: this.buildAuthHeader(),
        },
      );
    } catch (error) {
      this.logger.warn(`Failed to update status for ${correlationId}: ${error.message}`);
    }
  }

  private buildAuthHeader() {
    const token = this.config.get<string>('SERVICE_AUTH_TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

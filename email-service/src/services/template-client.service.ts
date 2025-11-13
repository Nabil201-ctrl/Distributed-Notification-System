import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TemplatePayload {
  id: string;
  name: string;
  type: string;
  body: string;
  variables?: Record<string, any>;
  subject?: string;
}

@Injectable()
export class TemplateClientService {
  private readonly logger = new Logger(TemplateClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('TEMPLATE_SERVICE_URL', 'https://template-service-277t.onrender.com');
  }

  async getTemplate(templateId: string): Promise<TemplatePayload> {
    try {
      const { data } = await this.http.axiosRef.get<TemplatePayload>(
        `${this.baseUrl}/templates/${templateId}`,
        {
          headers: this.buildAuthHeader(),
        },
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch template ${templateId}: ${error.message}`);
      throw error;
    }
  }

  private buildAuthHeader() {
    const token = this.config.get<string>('SERVICE_AUTH_TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

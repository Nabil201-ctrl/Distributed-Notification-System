import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserContactInfo {
  email: string;
  push_token?: string | null;
  preferences: {
    email: boolean;
    push: boolean;
  };
}

@Injectable()
export class UserClientService {
  private readonly logger = new Logger(UserClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('USER_SERVICE_URL', 'https://user-service-giq0.onrender.com/');
  }

  async getContactInfo(userId: string): Promise<UserContactInfo> {
    try {
      const { data } = await this.http.axiosRef.get<{ data: UserContactInfo }>(
        `${this.baseUrl}/api/v1/users/${userId}/contact-info`,
        {
          headers: this.buildAuthHeader(),
        },
      );
      return data.data;
    } catch (error) {
      this.logger.error(`Failed to fetch contact info for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  private buildAuthHeader() {
    const token = this.config.get<string>('SERVICE_AUTH_TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserContactInfo {
    email: string;
    push_token: string | null;
    preferences: {
        email: boolean;
        push: boolean;
    };
}

@Injectable()
export class UserServiceClient {
    private readonly logger = new Logger(UserServiceClient.name);
    private readonly userServiceUrl: string;

    constructor(private configService: ConfigService) {
        this.userServiceUrl =
            this.configService.get<string>('USER_SERVICE_URL') ||
            'http://localhost:3001';
    }

    /**
     * Forward authenticated request to User Service
     * Gateway just passes the JWT token from the incoming request
     */
    async getUserContactInfo(
        userId: string,
        token: string,
    ): Promise<UserContactInfo> {
        try {
            const response = await fetch(
                `${this.userServiceUrl}/api/v1/users/${userId}/contact-info`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                },
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`User not found: ${userId}`);
                }
                if (response.status === 403) {
                    throw new Error('Forbidden: Insufficient permissions');
                }
                throw new Error(`User Service returned ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to get user contact info');
            }

            return result.data;
        } catch (error) {
            this.logger.error(
                `Failed to get user contact info for ${userId}:`,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Health check - no authentication needed
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.userServiceUrl}/health/live`, {
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
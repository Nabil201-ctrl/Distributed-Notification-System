import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UpstashRedisService {
    private readonly logger = new Logger(UpstashRedisService.name);
    private readonly restUrl: string;
    private readonly restToken: string;

    constructor(private configService: ConfigService) {
        this.restUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL', '');
        this.restToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN', '');

        if (!this.restUrl || !this.restToken) {
            this.logger.warn('Upstash Redis credentials not configured');
        }
    }

    private async executeCommand(command: string[]): Promise<any> {
        try {
            const response = await fetch(`${this.restUrl}/${command.join('/')}`, {
                headers: {
                    Authorization: `Bearer ${this.restToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Upstash Redis error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            this.logger.error(`Redis command failed: ${error.message}`);
            throw error;
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            const result = await this.executeCommand(['GET', key]);
            return result;
        } catch (error) {
            this.logger.error(`Failed to get key ${key}: ${error.message}`);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            const command = ['SET', key, value];
            if (ttlSeconds) {
                command.push('EX', ttlSeconds.toString());
            }
            await this.executeCommand(command);
        } catch (error) {
            this.logger.error(`Failed to set key ${key}: ${error.message}`);
            throw error;
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.executeCommand(['DEL', key]);
        } catch (error) {
            this.logger.error(`Failed to delete key ${key}: ${error.message}`);
            throw error;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.executeCommand(['EXISTS', key]);
            return result === 1;
        } catch (error) {
            this.logger.error(`Failed to check existence of key ${key}: ${error.message}`);
            return false;
        }
    }

    async setJson(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const jsonString = JSON.stringify(value);
        await this.set(key, jsonString, ttlSeconds);
    }

    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch (error) {
            this.logger.error(`Failed to parse JSON for key ${key}: ${error.message}`);
            return null;
        }
    }

    async increment(key: string): Promise<number> {
        try {
            const result = await this.executeCommand(['INCR', key]);
            return result;
        } catch (error) {
            this.logger.error(`Failed to increment key ${key}: ${error.message}`);
            throw error;
        }
    }

    async expire(key: string, seconds: number): Promise<void> {
        try {
            await this.executeCommand(['EXPIRE', key, seconds.toString()]);
        } catch (error) {
            this.logger.error(`Failed to set expiry for key ${key}: ${error.message}`);
            throw error;
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            const result = await this.executeCommand(['TTL', key]);
            return result;
        } catch (error) {
            this.logger.error(`Failed to get TTL for key ${key}: ${error.message}`);
            return -1;
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            const result = await this.executeCommand(['KEYS', pattern]);
            return result || [];
        } catch (error) {
            this.logger.error(`Failed to get keys with pattern ${pattern}: ${error.message}`);
            return [];
        }
    }

    async flushAll(): Promise<void> {
        try {
            await this.executeCommand(['FLUSHALL']);
            this.logger.warn('Redis cache flushed');
        } catch (error) {
            this.logger.error(`Failed to flush cache: ${error.message}`);
            throw error;
        }
    }

    async ping(): Promise<boolean> {
        try {
            const result = await this.executeCommand(['PING']);
            return result === 'PONG';
        } catch (error) {
            this.logger.error(`Redis ping failed: ${error.message}`);
            return false;
        }
    }
}
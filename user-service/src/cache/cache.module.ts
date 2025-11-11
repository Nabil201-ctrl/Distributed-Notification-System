import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstashRedisService } from './upstash-redis.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [UpstashRedisService],
    exports: [UpstashRedisService],
})
export class CacheModule { }
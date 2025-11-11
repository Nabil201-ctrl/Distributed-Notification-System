import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { PushToken } from './entities/push-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, NotificationPreference, PushToken]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
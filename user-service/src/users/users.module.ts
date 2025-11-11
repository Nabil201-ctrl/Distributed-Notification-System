import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PushToken } from './entities/push-token.entity';
import { UserPreference } from './entities/user-preference.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserPreference, PushToken]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
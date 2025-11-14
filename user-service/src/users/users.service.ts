import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { UserPreference } from './entities/user-preference.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserPreference)
        private preferencesRepository: Repository<UserPreference>,
        private rabbitMQService: RabbitMQService,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
            push_token: createUserDto.push_token || null,
            role: UserRole.USER,
        });

        const preferences = this.preferencesRepository.create({
            email: createUserDto.preferences.email,
            push: createUserDto.preferences.push,
        });
        user.preferences = preferences;

        const savedUser = await this.userRepository.save(user);

        const notificationPayload = {
            template: 'welcome_email',
            variables: { name: savedUser.name },
            timestamp: new Date().toISOString(),
        };

        if (savedUser.preferences.email) {
            await this.rabbitMQService.publishNotificationRequest(
                savedUser.id,
                'email',
                notificationPayload
            );
        }

        if (savedUser.preferences.push && savedUser.push_token) {
            await this.rabbitMQService.publishNotificationRequest(
                savedUser.id,
                'push',
                notificationPayload
            );
        }

        await this.rabbitMQService.publishUserEvent({
            event_type: 'user.created',
            user_id: savedUser.id,
            email: savedUser.email,
            push_token: savedUser.push_token ?? undefined,
            preferences: {
                email: savedUser.preferences.email,
                push: savedUser.preferences.push,
            },
            timestamp: new Date().toISOString(),
        });

        delete savedUser.password;
        delete savedUser.refresh_token;

        return savedUser;
    }


    async getUserById(
        id: string,
        requestingUserId?: string,
        requestingUserRole?: UserRole,
    ): Promise<User> {
        if (requestingUserId && requestingUserRole !== UserRole.ADMIN) {
            if (requestingUserId !== id && requestingUserRole !== UserRole.SERVICE) {
                throw new ForbiddenException('Access denied');
            }
        }

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['preferences'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        delete user.password;
        delete user.refresh_token;

        return user;
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDto,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<User> {
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['preferences'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.name) user.name = updateUserDto.name;
        if (updateUserDto.push_token !== undefined) user.push_token = updateUserDto.push_token;

        if (updateUserDto.preferences) {
            if (user.preferences) {
                user.preferences.email = updateUserDto.preferences.email;
                user.preferences.push = updateUserDto.preferences.push;
                await this.preferencesRepository.save(user.preferences);
            } else {
                const newPreferences = this.preferencesRepository.create({
                    user_id: user.id,
                    email: updateUserDto.preferences.email,
                    push: updateUserDto.preferences.push,
                });
                user.preferences = await this.preferencesRepository.save(newPreferences);
            }
        }

        const updatedUser = await this.userRepository.save(user);

        await this.rabbitMQService.publishUserEvent({
            event_type: 'user.updated',
            user_id: updatedUser.id,
            email: updatedUser.email,
            push_token: updatedUser.push_token ?? undefined,
            preferences: {
                email: updatedUser.preferences.email,
                push: updatedUser.preferences.push,
            },
            timestamp: new Date().toISOString(),
        });

        delete updatedUser.password;
        delete updatedUser.refresh_token;

        return updatedUser;
    }

    async deleteUser(
        id: string,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<void> {
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.remove(user);

        await this.rabbitMQService.publishUserEvent({
            event_type: 'user.deleted',
            user_id: id,
            email: user.email,
            timestamp: new Date().toISOString(),
        });
    }

    async getUserContactInfo(userId: string): Promise<{
        email: string;
        push_token: string | null;
        preferences: { email: boolean; push: boolean };
    }> {
        const user = await this.getUserById(userId);

        return {
            email: user.email,
            push_token: user.push_token,
            preferences: {
                email: user.preferences.email,
                push: user.preferences.push,
            },
        };
    }

    async updatePushToken(
        userId: string,
        pushToken: string,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<User> {
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['preferences'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.push_token = pushToken;
        const updatedUser = await this.userRepository.save(user);

        delete updatedUser.password;
        delete updatedUser.refresh_token;

        return updatedUser;
    }

    async removePushToken(
        userId: string,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<void> {
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.push_token = null;
        await this.userRepository.save(user);
    }

    async getAllUsers(
        page: number = 1,
        limit: number = 10,
        requestingUserRole: UserRole,
    ): Promise<{ users: User[]; total: number }> {
        if (
            requestingUserRole !== UserRole.ADMIN &&
            requestingUserRole !== UserRole.SERVICE
        ) {
            throw new ForbiddenException('Access denied');
        }

        const [users, total] = await this.userRepository.findAndCount({
            relations: ['preferences'],
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
        });

        users.forEach((user) => {
            delete user.password;
            delete user.refresh_token;
        });

        return { users, total };
    }
}

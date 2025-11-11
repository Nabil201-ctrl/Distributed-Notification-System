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
import { UpstashRedisService } from '../cache/upstash-redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserPreference)
        private preferencesRepository: Repository<UserPreference>,
        private redisService: UpstashRedisService,
        private rabbitMQService: RabbitMQService,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create user
        const user = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashedPassword,
            push_token: createUserDto.push_token || null,
            role: UserRole.USER,
        });

        // Create user preferences
        const preferences = this.preferencesRepository.create({
            email: createUserDto.preferences.email,
            push: createUserDto.preferences.push,
        });

        user.preferences = preferences;

        const savedUser = await this.userRepository.save(user);

        // Cache user data
        await this.cacheUser(savedUser);

        // Publish user.created event to RabbitMQ
        await this.rabbitMQService.publishUserEvent({
            event_type: 'user.created',
            user_id: savedUser.id,
            email: savedUser.email,
            push_token: savedUser.push_token,
            preferences: {
                email: savedUser.preferences.email,
                push: savedUser.preferences.push,
            },
            timestamp: new Date().toISOString(),
        });

        // Remove password from response
        delete savedUser.password;
        delete savedUser.refresh_token;

        return savedUser;
    }

    async getUserById(
        id: string,
        requestingUserId?: string,
        requestingUserRole?: UserRole,
    ): Promise<User> {
        // Authorization check
        if (requestingUserId && requestingUserRole !== UserRole.ADMIN) {
            if (requestingUserId !== id && requestingUserRole !== UserRole.SERVICE) {
                throw new ForbiddenException('Access denied');
            }
        }

        // Try to get from cache first
        const cacheKey = `user:${id}`;
        const cachedUser = await this.redisService.getJson<User>(cacheKey);

        if (cachedUser) {
            return cachedUser;
        }

        // If not in cache, get from database
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['preferences'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        delete user.password;
        delete user.refresh_token;

        // Cache the user
        await this.cacheUser(user);

        return user;
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDto,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<User> {
        // Authorization check - users can only update their own profile
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

        // Update basic fields
        if (updateUserDto.name) {
            user.name = updateUserDto.name;
        }

        if (updateUserDto.push_token !== undefined) {
            user.push_token = updateUserDto.push_token;
        }

        // Update preferences if provided
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
                user.preferences = await this.preferencesRepository.save(
                    newPreferences,
                );
            }
        }

        const updatedUser = await this.userRepository.save(user);

        // Invalidate cache
        await this.invalidateUserCache(id);

        // Publish user.updated event
        await this.rabbitMQService.publishUserEvent({
            event_type: 'user.updated',
            user_id: updatedUser.id,
            email: updatedUser.email,
            push_token: updatedUser.push_token,
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
        // Only admins or the user themselves can delete
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== id) {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.remove(user);
        await this.invalidateUserCache(id);

        // Publish user.deleted event
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
        preferences: {
            email: boolean;
            push: boolean;
        };
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
        // Authorization check
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

        await this.invalidateUserCache(userId);

        delete updatedUser.password;
        delete updatedUser.refresh_token;

        return updatedUser;
    }

    async removePushToken(
        userId: string,
        requestingUserId: string,
        requestingUserRole: UserRole,
    ): Promise<void> {
        // Authorization check
        if (requestingUserRole !== UserRole.ADMIN && requestingUserId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.push_token = null;
        await this.userRepository.save(user);
        await this.invalidateUserCache(userId);
    }

    async getAllUsers(
        page: number = 1,
        limit: number = 10,
        requestingUserRole: UserRole,
    ): Promise<{ users: User[]; total: number }> {
        // Only admins and services can list all users
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

        // Remove sensitive data
        users.forEach((user) => {
            delete user.password;
            delete user.refresh_token;
        });

        return { users, total };
    }

    private async cacheUser(user: User): Promise<void> {
        const cacheKey = `user:${user.id}`;
        await this.redisService.setJson(cacheKey, user, 300); // 5 minutes
    }

    private async invalidateUserCache(userId: string): Promise<void> {
        const cacheKey = `user:${userId}`;
        await this.redisService.del(cacheKey);
    }
}
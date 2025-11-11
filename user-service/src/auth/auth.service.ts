import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Account is deactivated');
        }

        user.last_login = new Date();

        const tokens = await this.generateTokens(user);

        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
        user.refresh_token = hashedRefreshToken;
        await this.userRepository.save(user);

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_type: 'Bearer',
            expires_in: 3600,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: {
                    email: user.preferences.email,
                    push: user.preferences.push,
                },
            },
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
                relations: ['preferences'],
            });

            if (!user || !user.refresh_token) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isValidRefreshToken = await bcrypt.compare(
                refreshToken,
                user.refresh_token,
            );

            if (!isValidRefreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const tokens = await this.generateTokens(user);

            const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
            user.refresh_token = hashedRefreshToken;
            await this.userRepository.save(user);

            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_type: 'Bearer',
                expires_in: 3600,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string) {
        await this.userRepository.update(userId, { refresh_token: null });
        return { message: 'Logged out successfully' };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['preferences'],
        });

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async generateTokens(user: User) {
        const accessPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'access',
        };

        const refreshPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'refresh',
        };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '1h',
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return { access_token, refresh_token };
    }

    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
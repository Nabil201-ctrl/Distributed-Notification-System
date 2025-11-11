import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse as SwaggerResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @SwaggerResponse({
        status: 200,
        description: 'Login successful',
        type: AuthResponseDto,
    })
    @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto) {
        try {
            const result = await this.authService.login(loginDto);
            return ApiResponse.success(result, 'Login successful');
        } catch (error) {
            return ApiResponse.error(error.message, 'Login failed');
        }
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @SwaggerResponse({
        status: 200,
        description: 'Token refreshed successfully',
    })
    @SwaggerResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Body('refresh_token') refreshToken: string) {
        try {
            const result = await this.authService.refreshTokens(refreshToken);
            return ApiResponse.success(result, 'Token refreshed successfully');
        } catch (error) {
            return ApiResponse.error(error.message, 'Token refresh failed');
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout' })
    @SwaggerResponse({ status: 200, description: 'Logout successful' })
    @SwaggerResponse({ status: 401, description: 'Unauthorized' })
    async logout(@CurrentUser('id') userId: string) {
        try {
            const result = await this.authService.logout(userId);
            return ApiResponse.success(result, 'Logout successful');
        } catch (error) {
            return ApiResponse.error(error.message, 'Logout failed');
        }
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify token and get current user' })
    @SwaggerResponse({ status: 200, description: 'Token is valid' })
    @SwaggerResponse({ status: 401, description: 'Invalid token' })
    async verify(@CurrentUser() user: any) {
        return ApiResponse.success(
            { user },
            'Token is valid',
        );
    }
}
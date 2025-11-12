import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse as SwaggerResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, PaginationMeta } from '../common/dto/api-response.dto';
import { UserResponse } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user (Registration)' })
    @SwaggerResponse({
        status: 201,
        description: 'User created successfully',
        type: UserResponse,
    })
    @SwaggerResponse({ status: 409, description: 'User already exists' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);
        return ApiResponse.success(user, 'User created successfully');
    }

    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.SERVICE)
    @ApiOperation({ summary: 'Get all users (Admin/Service only)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @SwaggerResponse({
        status: 200,
        description: 'Users retrieved successfully',
    })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async getAllUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @CurrentUser('role') role: UserRole,
    ) {
        const { users, total } = await this.usersService.getAllUsers(
            Number(page),
            Number(limit),
            role,
        );

        const meta: PaginationMeta = {
            total,
            limit: Number(limit),
            page: Number(page),
            total_pages: Math.ceil(total / Number(limit)),
            has_next: Number(page) * Number(limit) < total,
            has_previous: Number(page) > 1,
        };

        return ApiResponse.success(users, 'Users retrieved successfully', meta);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: UserResponse,
    })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async getUserById(
        @Param('id') id: string,
        @CurrentUser('id') requestingUserId: string,
        @CurrentUser('role') requestingUserRole: UserRole,
    ) {
        const user = await this.usersService.getUserById(
            id,
            requestingUserId,
            requestingUserRole,
        );
        return ApiResponse.success(user, 'User retrieved successfully');
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user information' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({
        status: 200,
        description: 'User updated successfully',
    })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser('id') requestingUserId: string,
        @CurrentUser('role') requestingUserRole: UserRole,
    ) {
        const user = await this.usersService.updateUser(
            id,
            updateUserDto,
            requestingUserId,
            requestingUserRole,
        );
        return ApiResponse.success(user, 'User updated successfully');
    }

    @Delete(':id')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete user account' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({ status: 200, description: 'User deleted successfully' })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async deleteUser(
        @Param('id') id: string,
        @CurrentUser('id') requestingUserId: string,
        @CurrentUser('role') requestingUserRole: UserRole,
    ) {
        await this.usersService.deleteUser(
            id,
            requestingUserId,
            requestingUserRole,
        );
        return ApiResponse.success(null, 'User deleted successfully');
    }

    @Get(':id/contact-info')
    @ApiBearerAuth()
    @Roles(UserRole.SERVICE, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get user contact information for notifications',
        description:
            'Used by API Gateway and notification services to retrieve user email, push token, and preferences',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({
        status: 200,
        description: 'Contact info retrieved successfully',
    })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied - Service role required' })
    async getUserContactInfo(@Param('id') id: string) {
        const contactInfo = await this.usersService.getUserContactInfo(id);
        return ApiResponse.success(
            contactInfo,
            'Contact info retrieved successfully',
        );
    }

    @Put(':id/push-token')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update push notification token' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({ status: 200, description: 'Push token updated' })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async updatePushToken(
        @Param('id') id: string,
        @Body('push_token') pushToken: string,
        @CurrentUser('id') requestingUserId: string,
        @CurrentUser('role') requestingUserRole: UserRole,
    ) {
        const user = await this.usersService.updatePushToken(
            id,
            pushToken,
            requestingUserId,
            requestingUserRole,
        );
        return ApiResponse.success(user, 'Push token updated successfully');
    }

    @Delete(':id/push-token')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove push notification token' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @SwaggerResponse({ status: 200, description: 'Push token removed' })
    @SwaggerResponse({ status: 404, description: 'User not found' })
    @SwaggerResponse({ status: 403, description: 'Access denied' })
    async removePushToken(
        @Param('id') id: string,
        @CurrentUser('id') requestingUserId: string,
        @CurrentUser('role') requestingUserRole: UserRole,
    ) {
        await this.usersService.removePushToken(
            id,
            requestingUserId,
            requestingUserRole,
        );
        return ApiResponse.success(null, 'Push token removed successfully');
    }
}

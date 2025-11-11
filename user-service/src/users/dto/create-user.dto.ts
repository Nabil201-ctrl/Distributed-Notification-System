import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserPreferenceDto } from './user-preference.dto';
import { NotificationPreferenceDto } from './notification-preference.dto';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecurePassword123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        required: false,
        example: 'fcm_token_12345',
        description: 'Optional push notification token',
    })
    @IsOptional()
    @IsString()
    push_token?: string;

    @ApiProperty({
        type: UserPreferenceDto,
        example: { email: true, push: true },
    })
    @ValidateNested()
    @Type(() => UserPreferenceDto)
    preferences: UserPreferenceDto;

    @ApiProperty({
        type: NotificationPreferenceDto,
        required: false,
        example: {
            email_enabled: true,
            push_enabled: true,
            marketing_enabled: true,
            security_alerts_enabled: true,
            quiet_hours: {
                enabled: true,
                start_time: '22:00',
                end_time: '07:00',
                timezone: 'Africa/Lagos',
            },
        },
    })
    @ValidateNested()
    @Type(() => NotificationPreferenceDto)
    @IsOptional()
    notification_preferences?: NotificationPreferenceDto;
}

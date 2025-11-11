import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPreferenceDto {
    @ApiProperty({ example: true, description: 'Enable email notifications' })
    @IsBoolean()
    email: boolean;

    @ApiProperty({ example: true, description: 'Enable push notifications' })
    @IsBoolean()
    push: boolean;
}
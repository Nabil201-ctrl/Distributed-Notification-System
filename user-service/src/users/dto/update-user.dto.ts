import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserPreferenceDto } from './user-preference.dto';

export class UpdateUserDto {
    @ApiProperty({ required: false, example: 'John Updated' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, example: 'fcm_token_updated' })
    @IsOptional()
    @IsString()
    push_token?: string;

    @ApiProperty({ required: false, type: UserPreferenceDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => UserPreferenceDto)
    preferences?: UserPreferenceDto;
}
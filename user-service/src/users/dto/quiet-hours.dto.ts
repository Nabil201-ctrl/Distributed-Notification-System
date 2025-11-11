import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuietHoursDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    enabled: boolean;

    @ApiProperty({ example: '22:00' })
    @IsOptional()
    @IsString()
    start_time?: string;

    @ApiProperty({ example: '07:00' })
    @IsOptional()
    @IsString()
    end_time?: string;

    @ApiProperty({ example: 'Africa/Lagos' })
    @IsOptional()
    @IsString()
    timezone?: string;
}

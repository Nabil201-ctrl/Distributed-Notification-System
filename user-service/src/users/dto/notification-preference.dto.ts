import { IsBoolean, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuietHoursDto } from './quiet-hours.dto';

export class NotificationPreferenceDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    email_enabled?: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    push_enabled?: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    marketing_enabled?: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    security_alerts_enabled?: boolean;

    @ApiProperty({ type: QuietHoursDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => QuietHoursDto)
    quiet_hours?: QuietHoursDto;
}

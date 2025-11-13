import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class TestEmailDto {
  @ApiProperty({ description: 'User id to lookup contact info', example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Template id to render', example: 'template-uuid' })
  @IsString()
  @IsNotEmpty()
  template_id: string;

  @ApiProperty({ enum: ['email'], default: 'email' })
  @IsEnum(['email'])
  type: 'email' = 'email';

  @ApiProperty({
    description: 'Variables passed to template rendering',
    example: { name: 'Njay', product: 'Alpha' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsObject()
  variables: Record<string, any>;

  @ApiProperty({ description: 'ISO timestamp', example: '2025-11-12T09:11:06.010Z' })
  @IsString()
  timestamp: string;
}

import {
  IsEmail,
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailRequestDto {
  @ApiPropertyOptional({
    description: 'User ID to send email to (will fetch email from User Service)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Direct email address (alternative to user_id)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  to?: string;

  @ApiPropertyOptional({
    description: 'Email subject',
    example: 'Welcome to our platform!',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    description: 'Email body (HTML or plain text)',
    example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Template ID to use',
    example: 'welcome_email',
  })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({
    description: 'Template name',
    example: 'Welcome Email Template',
  })
  @IsOptional()
  @IsString()
  template_name?: string;

  @ApiPropertyOptional({
    description: 'Variables for template',
    example: { name: 'John', action_url: 'https://example.com/verify' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: ['low', 'normal', 'high'],
    example: 'normal',
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high'])
  priority?: 'low' | 'normal' | 'high';
}
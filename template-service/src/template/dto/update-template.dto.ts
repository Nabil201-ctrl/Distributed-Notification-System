import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiPropertyOptional({ example: 'onboarding_email' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'push' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Welcome {{name}}, open the app to continue.' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    example: { name: 'Ada', deeplink: 'myapp://home' },
    type: 'object',
    additionalProperties: { type: 'string' }
  })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}

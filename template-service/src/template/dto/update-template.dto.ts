import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  body?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}

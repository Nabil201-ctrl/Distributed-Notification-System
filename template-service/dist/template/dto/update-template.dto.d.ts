import { CreateTemplateDto } from './create-template.dto';
declare const UpdateTemplateDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTemplateDto>>;
export declare class UpdateTemplateDto extends UpdateTemplateDto_base {
    name?: string;
    type?: string;
    body?: string;
    variables?: Record<string, any>;
}
export {};

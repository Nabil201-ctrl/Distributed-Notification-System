import { Template } from './template.entity';
export declare class TemplateHistory {
    id: string;
    template: Template;
    templateId: string;
    name: string;
    type: string;
    body: string;
    variables: Record<string, any>;
    versionedAt: Date;
}

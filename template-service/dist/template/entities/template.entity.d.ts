import { TemplateHistory } from './template-history.entity';
export declare class Template {
    id: string;
    name: string;
    type: string;
    body: string;
    variables: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    history: TemplateHistory[];
}

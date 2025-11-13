export interface EmailLogRecord {
    messageId: string;
    userId: string;
    templateId: string;
    to: string;
    subject: string;
    variables: Record<string, any>;
    sentAt: string;
}
export declare class EmailLogService {
    private readonly records;
    record(entry: EmailLogRecord): void;
    get(messageId: string): EmailLogRecord | undefined;
}

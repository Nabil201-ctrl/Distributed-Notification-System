export declare class EmailLogResponseDto {
    messageId: string;
    userId: string;
    templateId: string;
    to: string;
    subject: string;
    variables: Record<string, any>;
    sentAt: string;
}

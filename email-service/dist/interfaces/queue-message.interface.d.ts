export interface QueueMessage {
    correlation_id?: string;
    user_id: string;
    template_id: string;
    variables: Record<string, any>;
    type: 'email';
    timestamp: string;
}

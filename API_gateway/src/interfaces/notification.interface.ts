// Interface for email notification request
export interface EmailRequest {
  user_id: string;
  template_id: string;
  variables: Record<string, any>;
}

// Interface for push notification request  
export interface PushRequest {
  user_id: string;
  template_id: string;
  variables: Record<string, any>;
}

// Interface for notification status
export interface NotificationStatus {
  correlation_id: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  type: 'email' | 'push';
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Interface for RabbitMQ message
export interface QueueMessage {
  correlation_id: string;
  user_id: string;
  template_id: string;
  variables: Record<string, any>;
  type: 'email' | 'push';
  timestamp: string;
}
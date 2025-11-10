# Data Transfer via RabbitMQ

This document outlines the process of transferring notification data to other services using RabbitMQ.

## Hierarchy

The data transfer follows a typical publish-subscribe pattern using a topic exchange in RabbitMQ.

1.  **API Gateway (Producer):** The API Gateway receives a notification request (e.g., for email or push notification).
2.  **RabbitMQ Exchange:** The API Gateway publishes the notification data to a RabbitMQ topic exchange. The exchange is named `notification_exchange`.
3.  **RabbitMQ Queues:** Different services can subscribe to specific topics. For example, an `email_service` would bind a queue `email_queue` to the exchange with a routing key like `notification.email`. A `push_service` would bind a `push_queue` with a routing key `notification.push`.
4.  **Consumer Services:** The respective services (e.g., `email_service`, `push_service`) consume the messages from their queues and process them.

```
[API Gateway] --(JSON)--> [notification_exchange] --(routing_key)--> [email_queue] --> [Email Service]
                                     |
                                     +--(routing_key)--> [push_queue] --> [Push Notification Service]
```

## JSON Data Example

The data sent to the RabbitMQ exchange will be in JSON format. Here are examples for email and push notifications.

### Email Notification

```json
{
  "type": "email",
  "payload": {
    "to": "user@example.com",
    "subject": "Your Subject Here",
    "body": "This is the email body."
  },
  "metadata": {
    "timestamp": "2025-11-10T10:00:00Z",
    "source": "api-gateway",
    "correlationId": "abc-123-def-456"
  }
}
```

### Push Notification

```json
{
  "type": "push",
  "payload": {
    "token": "device_token_string",
    "title": "New Message",
    "message": "You have a new message."
  },
  "metadata": {
    "timestamp": "2025-11-10T10:05:00Z",
    "source": "api-gateway",
    "correlationId": "xyz-789-uvw-012"
  }
}
```
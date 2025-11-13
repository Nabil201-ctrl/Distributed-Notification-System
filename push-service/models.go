package main

import (
	"firebase.google.com/go/v4/messaging"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	Email                NotificationType = "email"
	Push                 NotificationType = "push"
	max_retries                           = 5
	retryDelayMs                          = int64(5000)
	retryExName                           = "retry-notifs_ex"
	retryQueueName                        = "retry-notifs_queue"
	retryQueueRoutingKey                  = "retried-messages"
	routingKey                            = "notifs"
	exName                                = "push_notifs"
	dlqRoutingKey                         = "failed-messages"
	dlxName                               = "push_notifs_dlx"
	dlqName                               = "push_notifs_dlq"
	token                                 = "e2SUbDFyiaLMoIjmSe6bDl:APA91bEYcdOP4yPHLdZdS9ZdHz0wvfZRDZVqXsV1nkLQzm5FmUfJ8yUOKyJYvF8ZTq5wgA4jc800KEUcbQjZRVlMDHVwC8cSX574yZyDqVt5iEVegavJ-YU"
)

type NotificationType string

type Publisher struct {
	channel *amqp.Channel
}

type Consumer struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	retryQueue string

	prefetchCount int
	workerCount   int
	RetryCount    int64

	client *messaging.Client
}

type ConsumerMetrics struct {
	messagesProcessed int
	messagesSucceeded int
	messagesFailed    int
	messagesRetried   int
}

// UserData holds user-specific information for the notification.
type UserData struct {
	Name string         `json:"name"`
	Link string         `json:"link"`
	Meta map[string]any `json:"meta,omitempty"`
}

// Notification represents a complete notification request.
type NotificationRequest struct {
	NotificationType NotificationType `json:"notification_type"`
	Token            string           `json:"token"`
	UserID           uuid.UUID        `json:"user_id"`
	TemplateCode     string           `json:"template_code"`
	Variables        UserData         `json:"variables"`
	RequestID        string           `json:"request_id"`
	Priority         int              `json:"priority"`
	Metadata         map[string]any   `json:"metadata,omitempty"`
}

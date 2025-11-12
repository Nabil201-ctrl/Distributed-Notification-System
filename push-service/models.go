package main

import (
	"firebase.google.com/go/v4/messaging"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

type NotificationType string

type Publisher struct {
	channel *amqp.Channel
}

const (
	Email NotificationType = "email"
	Push  NotificationType = "push"
)

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
	Name string                 `json:"name"`
	Link string                 `json:"link"`
	Meta map[string]interface{} `json:"meta,omitempty"`
}

// Notification represents a complete notification request.
type NotificationRequest struct {
	NotificationType NotificationType       `json:"notification_type"`
	UserID           uuid.UUID              `json:"user_id"`
	TemplateCode     string                 `json:"template_code"`
	Variables        UserData               `json:"variables"`
	RequestID        string                 `json:"request_id"`
	Priority         int                    `json:"priority"`
	Metadata         map[string]interface{} `json:"metadata,omitempty"`
}

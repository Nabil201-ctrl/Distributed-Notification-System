package main

import (
	"context"
	"fmt"

	"firebase.google.com/go/v4/messaging"
)

const (
	// TypeEmail is the "email" notification type
	TypeEmail NotificationType = "email"
	// TypePush is the "push" notification type
	TypePush NotificationType = "push"
)

func (c *Consumer) SendNotification(ctx context.Context, client *messaging.Client, token string, notifMessage NotificationRequest) error {
	registrationToken := token // e.g., "YOUR_DEVICE_REGISTRATION_TOKEN"

	if notifMessage.NotificationType != TypePush {
		return fmt.Errorf("invalid notification type, expected 'push', got '%s'", notifMessage.NotificationType)
	}

	dataPayload := map[string]string{
		"name":          notifMessage.Variables.Name,
		"link":          notifMessage.Variables.Link,
		"template_code": notifMessage.TemplateCode,
		"user_id":       notifMessage.UserID.String(),
		"request_id":    notifMessage.RequestID,
	}

	for k, v := range notifMessage.Metadata {
		dataPayload[k] = fmt.Sprintf("%v", v)
	}

	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: fmt.Sprintf("Hello, %s!", notifMessage.Variables.Name),
			Body:  fmt.Sprintf("You have a new update. Check it out here: %s", notifMessage.Variables.Link),
		},
		Data:  dataPayload,
		Token: registrationToken,
	}

	// Send the message
	response, err := client.Send(ctx, message)
	if err != nil {
		return fmt.Errorf("error sending message: %v\n", err)
	}

	fmt.Printf("Successfully sent message: %s\n", response)
	return nil
}

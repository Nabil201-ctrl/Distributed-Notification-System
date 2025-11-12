package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	InternalServerError = "Internal server error"
	NotFound            = "Country not found"
	ValidationFailed    = "Validation failed"
)

func (p *Publisher) notificationHandler(ctx *gin.Context) {
	var req NotificationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		log.Println(errorResponse(err))
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New(ValidationFailed)))
		return
	}

	body, err := json.Marshal(req)
	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		ctx.JSON(http.StatusInternalServerError, errorResponse(errors.New("Failed to process request")))
		return
	}

	err = p.channel.PublishWithContext(
		context.Background(),
		exName,   // exchange
		"notifs", // routing key
		false,    // mandatory
		false,    // immediate
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "text/plain",
			Body:         []byte(body),
		})
	failOnError(err, "Failed to publish a message")
	log.Printf(" [x] Sent %s\n", body)

	ctx.JSON(http.StatusAccepted, gin.H{"status": "queued", "request_id": req.RequestID})
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}

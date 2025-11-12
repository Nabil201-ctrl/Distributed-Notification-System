package main

import (
	"context"
	"encoding/json"
	"log"

	firebase "firebase.google.com/go/v4"
	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
	"google.golang.org/api/option"
)

func startConsumer(ch *amqp.Channel) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Note: .env file not found, reading from system environment")
	}

	c := Consumer{
		queueName:     "",
		retryQueue:    "retry_notif",
		prefetchCount: 1,
		workerCount:   5,
	}

	c.SetUp(ch)

	for r := 0; r < c.workerCount; r++ {
		if c.channel != nil {
			go c.newWorker(c.channel, c.queueName, r)
		} else {
			log.Fatal("couldn't launch workers")
		}
	}

	log.Printf(" [*] Started %d workers. Waiting for messages. To exit press CTRL+C", c.workerCount)
	forever := make(chan struct{})
	<-forever
}

func (c *Consumer) SetUp(ch *amqp.Channel) {
	c.channel = ch
	// Declare the notification dlx
	err := ch.ExchangeDeclare(
		dlxName,  // name
		"direct", // type (direct, fanout, topic, etc.)
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	failOnError(err, "Failed to declare notifs dlx")

	err = ch.ExchangeDeclare(
		retryExName, // name
		"direct",    // type (direct, fanout, topic, etc.)
		true,        // durable
		false,       // auto-deleted
		false,       // internal
		false,       // no-wait
		nil,         // arguments
	)
	failOnError(err, "Failed to declare retry notifs exchange")

	// Configure channel
	err = ch.Qos(
		c.prefetchCount, // prefetch count
		0,               // prefetch size
		false,           // global
	)
	failOnError(err, "Failed to set QoS")

	// Declare arguments for queue
	args := amqp.Table{
		"x-dead-letter-exchange":    dlxName,
		"x-dead-letter-routing-key": dlqRoutingKey,
	}

	q, err := ch.QueueDeclare(
		"",    // name
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		args,  // arguments
	)
	failOnError(err, "Failed to declare main queue")
	c.queueName = q.Name

	err = ch.QueueBind(
		q.Name,     // queue name
		routingKey, // routing key
		exName,     // exchange
		false,
		nil)
	failOnError(err, "Failed to bind main queue with main exchange")

	dlqName := "my-app-dlq"

	_, err = ch.QueueDeclare(
		dlqName, // name
		true,    // durable
		false,   // auto-deleted
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
	failOnError(err, "Failed to declare notifs dlq")

	err = ch.QueueBind(
		dlqName,       // queue name
		dlqRoutingKey, // routing key
		dlxName,       // exchange name
		false,         // no-wait
		nil,           // arguments
	)
	failOnError(err, "Failed to bind dlq to dlx")

	args = amqp.Table{
		"x-dead-letter-exchange":    exName,
		"x-message-ttl":             retryDelayMs,
		"x-dead-letter-routing-key": routingKey,
	}

	_, err = ch.QueueDeclare(
		retryQueueName, // name
		true,           // durable
		false,          // auto-deleted
		false,          // exclusive
		false,          // no-wait
		args,           // arguments
	)
	failOnError(err, "Failed to declare retry notifs queue")

	err = ch.QueueBind(
		retryQueueName,       // queue name
		retryQueueRoutingKey, // routing key
		retryExName,          // exchange name
		false,                // no-wait
		nil,                  // arguments
	)
	failOnError(err, "Failed to bind retry_notifs queue to retry_notifs exchange")

	setUpFirebaseClient(c)
}

func (c *Consumer) newWorker(ch *amqp.Channel, queueName string, id int) {
	msgs, err := ch.Consume(
		queueName, // queue
		"",        // consumer
		false,     // auto-ack
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		log.Printf("Worker %d Failed to register as a consumer: %s", id, err)
		return
	}

	go func() {
		for d := range msgs {

			var headerRetryCount int64 = 0
			if val, ok := d.Headers["x-retry-count"]; ok {
				if count, ok := val.(int64); ok {
					headerRetryCount = count
				}
			}

			log.Printf("Worker %d Received a message (Attempt %d): %s", id, headerRetryCount, d.Body)

			var notif NotificationRequest
			err := json.Unmarshal(d.Body, &notif)
			if err != nil {
				log.Printf("Worker %d FAILED to unmarshal JSON: %v. Sending to DLX.", id, err)

				d.Nack(false, false)
				continue
			}

			targetToken := notif.Token
			if targetToken == "" {
				targetToken = token
			}

			err = c.SendNotification(context.Background(), c.client, token, notif)

			if err != nil {
				log.Println("Worker failed")
				if headerRetryCount < max_retries {
					log.Println("Started retrying")
					d.Ack(false)

					err = ch.Publish(
						retryExName,          // exchange
						retryQueueRoutingKey, // routing key (use original)
						false,                // mandatory
						false,                // immediate
						amqp.Publishing{
							ContentType: d.ContentType,
							Body:        d.Body,
							Headers: amqp.Table{
								"x-retry-count": headerRetryCount + 1,
							},
						},
					)
					log.Println("Finished publishing retry")
					if err != nil {
						log.Printf("Error publishing to retry exchange: %s", err)
					}
				} else {
					log.Printf("Max retries (%d) exceeded. Sending to DLX.", max_retries)

					d.Nack(false, false)
				}
			} else {
				if ackErr := d.Ack(false); ackErr != nil {
					log.Printf(" [Worker %d] Failed to ack: %v", id, ackErr)
				} else {
					log.Printf(" [Worker %d] Message acknowledged", id)
				}
			}
		}
	}()
}

func setUpFirebaseClient(c *Consumer) {
	ctx := context.Background()
	opt := option.WithCredentialsFile("./serviceAccountKey.json")

	config := firebase.Config{
		ProjectID: "pushservice-8f271",
	}

	app, err := firebase.NewApp(ctx, &config, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		log.Fatalf("error getting Messaging client: %v\n", err)
	}
	c.client = client
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

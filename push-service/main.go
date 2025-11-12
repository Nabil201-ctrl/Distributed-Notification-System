package main

import (
	// "context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/jackc/pgx/v5/stdlib" // PostgreSQL driver
	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go" // RabbitMQ client
)

func main() {
	err := godotenv.Load("app.env")
	if err != nil {
		log.Println("Note: .env file not found, reading from system environment")
	}

	amqpURL := os.Getenv("RABBITMQ_URL")
	if amqpURL == "" {
		log.Fatal("RABBITMQ_URL is not set")
	}

	// 1. Connect to RabbitMQ ONCE
	conn, err := amqp.Dial(amqpURL)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		exName,
		"direct",
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,   // arguments
	)
	failOnError(err, "Failed to declare exchange")

	// 3. Create our publisher
	publisher := &Publisher{
		channel: ch,
	}

	log.Println("[Main] Starting background consumer workers...")
	go startConsumer()
	// --- END NEW PART ---

	// 5. Set up and run the Gin router (this blocks the main thread)
	router := gin.Default()
	router.POST("/notification", publisher.notificationHandler)

	log.Println("[API] Starting API server on :8080")
	router.Run(":8080")
}

// connectPostgreSQL connects to your Aiven PostgreSQL database
func connectPostgreSQL() {
	// Construct the connection string (DSN)
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		os.Getenv("DATABASE_HOST"),
		os.Getenv("DATABASE_PORT"),
		os.Getenv("DATABASE_USERNAME"),
		os.Getenv("DATABASE_PASSWORD"),
		os.Getenv("DATABASE_NAME"),
	)

	// Open the connection
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Printf("Failed to open PostgreSQL connection: %v\n", err)
		return
	}
	defer db.Close()

	// Ping the database to verify the connection
	err = db.Ping()
	if err != nil {
		log.Printf("Failed to ping PostgreSQL: %v\n", err)
		return
	}

	log.Println("✅ Successfully connected to PostgreSQL (Aiven)!")
}

// connectUpstashRedis connects to your Upstash Redis REST API
// func connectUpstashRedis() {
// 	client := upstash.NewClient(
// 		os.Getenv("UPSTASH_REDIS_REST_URL"),
// 		os.Getenv("UPSTASH_REDIS_REST_TOKEN"),
// 	)

// 	// Ping the server
// 	ctx := context.Background()
// 	res, err := client.Ping(ctx)
// 	if err != nil {
// 		log.Printf("Failed to ping Upstash Redis: %v\n", err)
// 		return
// 	}

// 	log.Printf("✅ Successfully connected to Upstash Redis! (Ping response: %s)\n", res)
// }

// connectRabbitMQ connects to your CloudAMQP RabbitMQ instance
func connectRabbitMQ() {
	// Get the connection URL from the environment
	amqpURL := os.Getenv("RABBITMQ_URL")
	if amqpURL == "" {
		log.Println("RABBITMQ_URL is not set")
		return
	}

	// Dial the server
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		log.Printf("Failed to connect to RabbitMQ: %v\n", err)
		return
	}
	defer conn.Close()

	log.Println("✅ Successfully connected to RabbitMQ (CloudAMQP)!")
}

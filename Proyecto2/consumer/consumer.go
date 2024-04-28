package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx = context.Background()
var db *mongo.Database
var rdb *redis.Client

type Data struct {
	Name  string
	Album string
	Year  string
	Rank  string
}

type Log struct {
	Id      primitive.ObjectID `bson:"_id,omitempty"`
	Mensaje string
	Fecha   time.Time
}

func mongoConnect() {
	clientOptions := options.Client().ApplyURI("mongodb://35.193.21.119:27017")
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	db = client.Database("so1-proyecto2")
	fmt.Println("Conexión a MongoDB exitosa")
}

func redisConnect() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     "35.194.26.20:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Conexión a Redis exitosa:", pong)
}

func insertMongo(log Log) {
	collection := db.Collection("logs")

	_, err := collection.InsertOne(ctx, log)
	if err != nil {
		fmt.Println("Error al insertar en MongoDB:", err)
	}
}

func insertRedis(data string) {
	// // Almacenar el valor en Redis
	result, err := rdb.HIncrBy(ctx, "data", data, 1).Result()
	if err != nil {
		fmt.Println("Error al insertar en Redis:", err)
		return
	}
	fmt.Println("Contador en Redis", result)
}

func main() {
	mongoConnect()
	redisConnect()
	// Configuración del consumidor
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true

	// Lista de brokers de Kafka
	brokers := []string{"my-cluster-kafka-bootstrap:9092"}

	// Crear un consumidor
	consumer, err := sarama.NewConsumer(brokers, config)
	if err != nil {
		fmt.Printf("Error al crear el consumidor: %v\n", err)
		return
	}
	defer func() {
		if err := consumer.Close(); err != nil {
			fmt.Printf("Error al cerrar el consumidor: %v\n", err)
		}
	}()

	// Tema al que suscribirse
	topic := "votaciones"

	// Particiones a las que suscribirse
	partitionList, err := consumer.Partitions(topic)
	if err != nil {
		fmt.Printf("Error al obtener las particiones: %v\n", err)
		return
	}

	// Canal para manejar señales de interrupción (Ctrl+C)
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt)

	// Esperar grupos de espera
	var wg sync.WaitGroup
	wg.Add(len(partitionList))

	// Bucle para cada partición
	for _, partition := range partitionList {
		// Crear un consumidor de partición
		partitionConsumer, err := consumer.ConsumePartition(topic, partition, sarama.OffsetOldest)
		if err != nil {
			fmt.Printf("Error al crear el consumidor de partición: %v\n", err)
			return
		}

		// Goroutine para manejar mensajes de la partición
		go func(pc sarama.PartitionConsumer) {
			defer wg.Done()
			for {
				select {
				case msg := <-pc.Messages():
					// Estructura para almacenar los datos JSON
					var data Data

					// Decodificar el JSON en la estructura
					err := json.Unmarshal([]byte(string(msg.Value)), &data)
					if err != nil {
						fmt.Printf("Error al decodificar JSON: %v\n", err)
						return
					}

					// Insertar el mensaje en MongoDB con fecha y hora
					insertMongo(Log{
						Mensaje: "Voto recibido para: " + data.Name + " - " + data.Album,
						Fecha:   time.Now(), // Obtener la hora actual
					})

					// Insertar los datos en Redis
					insertRedis(string(msg.Value))
				case err := <-pc.Errors():
					fmt.Printf("Error: %v\n", err)
				case <-signals:
					return
				}
			}
		}(partitionConsumer)
	}

	// Esperar hasta que se reciba una señal de interrupción (Ctrl+C)
	<-signals

	// Esperar a que las goroutines terminen
	wg.Wait()
}

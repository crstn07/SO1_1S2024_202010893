package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	pb "server/proto"

	"google.golang.org/grpc"
)

var ctx = context.Background()
var db *mongo.Database
var rdb *redis.Client

type server struct {
	pb.UnimplementedGetInfoServer
}

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

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {

	fmt.Println("Recibí de cliente: ", in.GetName())
	data := Data{
		Name:  in.GetName(),
		Album: in.GetAlbum(),
		Year:  in.GetYear(),
		Rank:  in.GetRank(),
	}
	fmt.Println(data)

	// Insertar el mensaje en MongoDB con fecha y hora
	insertMongoDB(Log{
		Mensaje: "Voto recibido para: " + data.Name + " - " + data.Album,
		Fecha:   time.Now(), // Obtener la hora actual
	})

	// Insertar los datos en Redis
	insertRedis(data)

	return &pb.ReplyInfo{Info: "Hola cliente, recibí el comentario"}, nil
}

func insertMongoDB(log Log) {
	collection := db.Collection("logs")

	_, err := collection.InsertOne(ctx, log)
	if err != nil {
		fmt.Println("Error al insertar en MongoDB:", err)
	}
}

func insertRedis(data Data) {
	// Almacenar el valor en Redis
	datos, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	result, err := rdb.HIncrBy(ctx, "data", string(datos), 1).Result()
	if err != nil {
		fmt.Println("Error al insertar en Redis:", err)
		return
	}
	fmt.Println("Contador en Redis", result)
}

func main() {
	listen, err := net.Listen("tcp", ":3001")
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	mongoConnect()
	redisConnect()

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}

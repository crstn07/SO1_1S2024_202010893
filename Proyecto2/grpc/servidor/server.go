package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"strings"

	pb "server/proto"

	"github.com/IBM/sarama"
	"google.golang.org/grpc"
)

type server struct {
	pb.UnimplementedGetInfoServer
}

type Data struct {
	Name  string
	Album string
	Year  string
	Rank  string
}

var producer sarama.SyncProducer

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibí del cliente: ", in.GetName())
	data := Data{
		Name:  in.GetName(),
		Album: in.GetAlbum(),
		Year:  in.GetYear(),
		Rank:  in.GetRank(),
	}
	fmt.Println(data)

	datos, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error:", err)
		return nil, err
	}
	// Tema al que enviar mensajes
	topic := "votaciones"
	str := string(datos)
	str = strings.ReplaceAll(str, "Name", "name")
	str = strings.ReplaceAll(str, "Album", "album")
	str = strings.ReplaceAll(str, "Year", "year")
	str = strings.ReplaceAll(str, "Rank", "rank")

	// Mensaje a enviar
	message := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(string(str)),
	}

	// Enviar el mensaje usando el productor global
	partition, offset, err := producer.SendMessage(message)
	if err != nil {
		fmt.Printf("Error al enviar el mensaje: %v\n", err)
		return nil, err
	}

	fmt.Printf("Mensaje enviado a la partición %d, offset %d\n", partition, offset)

	return &pb.ReplyInfo{Info: "Hola cliente, recibí el comentario"}, nil
}

func main() {
	// Configuración del productor
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true

	// Lista de brokers de Kafka
	brokers := []string{"my-cluster-kafka-bootstrap:9092"}

	// Crear un productor
	var err error
	producer, err = sarama.NewSyncProducer(brokers, config)
	if err != nil {
		fmt.Printf("Error al crear el productor: %v\n", err)
		return
	}
	defer func() {
		if err := producer.Close(); err != nil {
			fmt.Printf("Error al cerrar el productor: %v\n", err)
		}
	}()

	fmt.Println("Servidor escuchando en puerto 3001")
	listen, err := net.Listen("tcp", ":3001")
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}

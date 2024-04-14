package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	pb "server/proto"

	_ "github.com/go-sql-driver/mysql"
	"google.golang.org/grpc"
)

var ctx = context.Background()
var db *sql.DB

type server struct {
	pb.UnimplementedGetInfoServer
}

const (
	port = ":3001"
)

type Data struct {
	Name  string
	Year  string
	Album string
	Rank  string
}

func mysqlConnect() {
	// Cambia las credenciales según tu configuración de MySQL
	dsn := "root:8#p$S3sZ=%Ruh=LS@tcp(34.27.185.172:3306)/tarea4"

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalln(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Conexión a MySQL exitosa")
}

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibí de cliente: ", in.GetName())
	data := Data{
		Name:  in.GetName(),
		Year:  in.GetYear(),
		Album: in.GetAlbum(),
		Rank:  in.GetRank(),
	}
	fmt.Println(data)
	insertMySQL(data)
	return &pb.ReplyInfo{Info: "Hola cliente, recibí la info"}, nil
}

func insertMySQL(voto Data) {
	// Prepara la consulta SQL para la inserción en MySQL
	query := "INSERT INTO votos (name, year, album, _rank) VALUES (?, ?, ?, ?)"
	_, err := db.ExecContext(ctx, query, voto.Name, voto.Year, voto.Album, voto.Rank)
	if err != nil {
		log.Println("Error al insertar en MySQL:", err)
	}
}

func main() {
	listen, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	mysqlConnect()

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}

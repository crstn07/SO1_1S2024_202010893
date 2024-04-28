use rocket::serde::json::{json, Value as JsonValue};
use rocket::serde::json::Json;
use rocket::response::status::BadRequest;
use rocket::config::SecretKey;
use rocket_cors::{AllowedOrigins, CorsOptions};
use rdkafka::config::ClientConfig;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::util::Timeout;
use std::time::Duration;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Data {
    #[serde(rename = "name")]
    name: String,
    #[serde(rename = "album")]
    album: String,
    #[serde(rename = "year")]
    year: String,
    #[serde(rename = "rank")]
    rank: String,
}


#[rocket::post("/data", data = "<data>")]
async fn receive_data(data: Json<Data>) -> Result<String, BadRequest<String>> {
    let received_data = data.into_inner();
    let response = JsonValue::from(json!({
        "message": format!("Received data: name: {}, year: {}, album: {}, rank: {}", received_data.name, received_data.album, received_data.year, received_data.rank)
    }));

    // Configuración del productor Kafka
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", "my-cluster-kafka-bootstrap:9092")
        .create()
        .expect("Producer creation error");

    // Tema al que enviar mensajes
    let topic = "votaciones";

    // Serializar datos a JSON
    let json_data = serde_json::to_string(&received_data).unwrap();

    // Enviar mensaje al tema
    producer
        .send(
            FutureRecord::to(topic)
                .payload(&json_data)
                .key("key") // Puedes definir una clave si es necesario
                .timestamp(Duration::from_secs(0).as_secs().try_into().unwrap()), // Opcional: marcar el tiempo del mensaje
            Timeout::Never, // Opcional: configurar un tiempo de espera
        )
        .await
        .unwrap();

    Ok(response.to_string())
}

#[rocket::main]
async fn main() {
    let secret_key = SecretKey::generate(); // Genera una nueva clave secreta

    // Configuración de opciones CORS
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .to_cors()
        .expect("failed to create CORS fairing");

    let config = rocket::Config {
        address: "0.0.0.0".parse().unwrap(),
        port: 8080,
        secret_key: secret_key.unwrap(), // Desempaqueta la clave secreta generada
        ..rocket::Config::default()
    };

    // Montar la aplicación Rocket con el middleware CORS
    rocket::custom(config)
        .attach(cors)
        .mount("/", rocket::routes![receive_data])
        .launch()
        .await
        .unwrap();
}
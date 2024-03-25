import redis

# Conectarse a Redis
client = redis.Redis(host='10.157.244.219', port=6379)

# Suscribirse al canal "test"
pubsub = client.pubsub()
pubsub.subscribe('test')

# Manejar los mensajes recibidos
for message in pubsub.listen():
    if message['type'] == 'message':
        data = message['data'].decode('utf-8')
        canal = message['channel'].decode('utf-8')
        print(f"Mensaje recibido en el canal '{canal}': {data}")

# Cerrar la conexión cuando haya terminado de suscribirse
client.close()

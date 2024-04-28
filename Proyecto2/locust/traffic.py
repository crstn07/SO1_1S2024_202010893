import json
from random import randrange
from locust import HttpUser, between, task

class readFile():
    def __init__(self):
        self.data = []

    def getData(self): #Metodo donde se obtiene un elemento de la lista de registros
        size = len(self.data) #Tamaño de los datos
        if size > 0:
            index = randrange(0, size - 1) if size > 1 else 0
            return self.data.pop(index)
        else:
            print("size -> 0")
            return None
    
    def loadFile(self):
        print("Cargando ...")
        try:
            with open("data.json", 'r', encoding='utf-8') as file:
                self.data = json.loads(file.read())
        except Exception:
            print(f'Error : {Exception}')
    
    def loadFile2(self):
        print("Cargando ...")
        try:
            with open("data2.json", 'r', encoding='utf-8') as file:
                self.data = json.loads(file.read())
        except Exception:
            print(f'Error : {Exception}')

class trafficData(HttpUser):
    wait_time = between(0.1, 0.2) #Tiempo de espera entre registros
    reader = readFile()
    reader.loadFile()

    def on_start(self):
        print("On Start")
    
    @task
    def sendMessage(self):
        data = self.reader.getData() #Registro obtenido de la lista
        if data is not None:
            res = self.client.post("/grpc/insert", json=data)
            response = res.json()
            print(response)
        else:
            print("Empty") #No hay mas datos por enviar
            self.stop(True)
    
    reader.loadFile2()
    @task
    def sendMessage2(self):
        data2 = self.reader.getData() #Registro obtenido de la lista
        if data2 is not None:
            res = self.client.post("/rust/send_data", json=data2)
            response = res.json()
            print(response)
        else:
            print("Empty") #No hay mas datos por enviar
            self.stop(True)

# python3 -m venv venv
# source venv/bin/activate
# pip install locust
# locust -f tu_script.py -> locust -f traffic.py
# http://localhost:3300 
# http://0.0.0.0:8089
# ingress: http://34.70.145.21



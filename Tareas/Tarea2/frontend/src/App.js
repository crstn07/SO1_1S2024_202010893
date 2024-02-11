import './App.css';

function App() {
  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const webcamElement = document.getElementById("webcam");
      webcamElement.srcObject = stream;
    } catch (error) {
      console.error("Error accediendo a la  webcam:", error);
    }
  }
  startWebcam();
  
  async function takePicture() {
    const webcamElement = document.getElementById("webcam");
    const canvas = document.createElement("canvas");
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(webcamElement, 0, 0, webcamElement.videoWidth, webcamElement.videoHeight);
    const imagen = canvas.toDataURL("image/png");
    const fecha = new Date();
    console.log(imagen, fecha);
    await fetch("http://localhost:5000/nuevaFoto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ imagen, fecha })
    })
      .then(response => response.json())
      .then(data => alert(data.mensaje))
      .catch(error => alert("Ocurrió un error: " + error));
  }
  return (
    <div className="App">
      <header className="App-header">
        <video id="webcam" width="500px" height="500px" autoPlay></video>
        <button onClick={takePicture}>Tomar foto</button>
      </header>
    </div>
  );
}

export default App;

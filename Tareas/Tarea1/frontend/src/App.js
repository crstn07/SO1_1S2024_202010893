import './App.css';

function App() {
  function obtenerDatos() {
    fetch(`http://localhost:5000/data`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        console.log("Respuesta: ",response);
        document.querySelector('#datos').innerHTML = response.datos;
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2> Tarea 1 - SO1 - 1s2024</h2>
        <button onClick={obtenerDatos}>Mostrar Datos</button>
        <p id="datos">
          
        </p>
      </header>
    </div>
  );
}

export default App;

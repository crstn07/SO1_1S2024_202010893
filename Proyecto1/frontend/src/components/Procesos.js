import React, { useEffect, useState } from 'react';
import Graph from 'graphviz-react';
    
function graficarArbol(pid,procesos) {
    const dot = ['digraph G {\nbgcolor="transparent" node [style=filled, color=cyan, fillcolor=cyan]\n; edge [color=lightblue];'];

    function agregarNodos(proceso) {
      dot.push(`"${proceso.pid}" [label="${proceso.pid}\n${proceso.nombre}"]`);
      if (proceso.hijo) {
        proceso.hijo.forEach(hijo => {
            agregarNodos(hijo);
          });
      }
    }
  
    function agregarConexiones(proceso) {
        if (proceso.hijo) {
            proceso.hijo.forEach(hijo => {
                dot.push(`"${proceso.pid}" -> "${hijo.pid}"`);
                agregarConexiones(hijo); // Llamada recursiva para manejar los hijos de cada hijo
              });
        }

    }
  
    procesos.forEach(proceso => {
        console.log(proceso.pid);
        console.log(pid);
        if (proceso.pid == pid) {
            agregarNodos(proceso);
            agregarConexiones(proceso);
        }
    });
  
    dot.push('}');
    console.log(dot.join('\n'));
    return dot.join('\n');
}


function ArbolProcesos() {
  async function getProcesos() {

    fetch(`/api/procesos`, {
      method: 'GET',
    })
    .then(res => res.json())
    .catch(err => {
      console.error('Error:', err)
      alert("Error")
    })
    .then(response => {
      setDatos(response.datos.procesos);
    })
  }
    const [procesos, setDatos] = useState([]);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  
    const handleProcesoChange = (event) => {
      const selectedProcess = event.target.value;
      setProcesoSeleccionado(selectedProcess);
    };
  
    return (
      <div>
      <button className="btn btn-dark btn-sm" style={{marginRight: '10px'}} onClick={getProcesos}>Obtener Procesos</button>
        <select onChange={handleProcesoChange}>
          <option value="">Selecciona un proceso</option>
          {/* Mapear procesos para crear opciones para el selector */}
          {procesos.map((proceso, index) => (
            <option key={index} value={proceso.pid}>
              {proceso.pid} - {proceso.nombre}
            </option>
          ))}
        </select>
  
        {procesoSeleccionado && (
          <Graph
            dot={graficarArbol(procesoSeleccionado,procesos)}
            options={{zoom:true, height: 400, width: 1200 }}
          />
        )}
      </div>
    );
  }
  
  export default ArbolProcesos;
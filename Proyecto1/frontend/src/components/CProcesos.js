import React, { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Recuerda la última función de callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Configura el intervalo.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
  
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

const ProcesosTabla = () => {
  const [procesos, setProcesos] = useState([]);

  var totalProcesos = procesos.length - 1;
  var procesosEnEjecucion = procesos.filter((proceso) => proceso.Estado === 0).length;
  var procesosSuspendidos = procesos.filter((proceso) => proceso.Estado === 1 || proceso.estado === 1026).length;
  var procesosDetenidos = procesos.filter((proceso) => proceso.Estado === 8).length;
  var procesosZombies = procesos.filter((proceso) => proceso.Estado === 4).length;

  useInterval(() => {
    fetch(`http://34.16.131.165:5000/procesos`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        //alert("No hay procesos")
    })
      .then(response => {
        setProcesos(response.procesos);
        totalProcesos = procesos.length - 1;
        procesosEnEjecucion = procesos.filter((proceso) => proceso.Estado === 0).length;
        procesosSuspendidos = procesos.filter((proceso) => proceso.Estado === 1 || proceso.estado === 1026 ).length;
        procesosDetenidos = procesos.filter((proceso) => proceso.Estado === 8).length;
        procesosZombies = procesos.filter((proceso) => proceso.Estado === 4).length;
    })  
  }, 5000);
  return (
    <table class="table" style={{width:"30%", margin:"auto", marginTop:"3%"}}>
      <thead class="table-dark">
        <tr>
          <th>Estado</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody class="table-light">
        <tr>
          <td>En ejecución</td>
          <td>{procesosEnEjecucion}</td>
        </tr>
        <tr>
          <td>Suspendidos</td>
          <td>{procesosSuspendidos}</td>
        </tr>
        <tr>
          <td>Detenidos</td>
          <td>{procesosDetenidos}</td>
        </tr>
        <tr>
          <td>Zombies</td>
          <td>{procesosZombies}</td>
        </tr>
        <tr>
          <td>Total</td>
          <td>{totalProcesos}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ProcesosTabla;
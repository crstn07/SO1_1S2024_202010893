import React, { useRef, useState, useEffect } from 'react';

/*const info = [
    {
      pid: 1,
      nombre: 'Proceso A',
      usuario: 'Usuario A',
      estado: 1,
      ram: '10%',
      hijos: [
        {
            pid: 2,
            nombre: 'Proceso A1',
            usuario: 'Usuario A1',
            estado: 2,
            ram: '10%',
          hijos: [],
        },
        {
          nombre: 'Proceso A2',
          descripcion: 'Este es el proceso A2',
          hijos: [
            {
              nombre: 'Proceso A21',
              descripcion: 'Este es el proceso A21',
              hijos: [],
            },
          ],
        },
      ],
    },
    {
      nombre: 'Proceso B',
      descripcion: 'Este es el proceso B',
      hijos: [
        {
          nombre: 'Proceso B1',
          descripcion: 'Este es el proceso B1',
          hijos: [],
        },
        {
          nombre: 'Proceso B2',
          descripcion: 'Este es el proceso B2',
          hijos: [],
        },
      ],
    },
  ];*/
  
const Arbol = ({ datos, onSeleccionarProceso }) => {
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

  const seleccionarProceso = (proceso) => {
    setProcesoSeleccionado(proceso);
    onSeleccionarProceso(proceso);
  };

  const renderizarProcesos = (procesos, esHijo) => {
    return procesos.map((proceso) => {
        return (
          <React.Fragment key={proceso.nombre}>
            <tr class={esHijo ? 'table-light' : 'table-success'}>
                <td>{proceso.PID}</td>
                <td>
                    <div onClick={() => seleccionarProceso(proceso)}>{proceso.Nombre}</div>
                </td>
                <td>{proceso.Usuario}</td>
                <td>{proceso.Estado === 0 ? 'En ejecución' : proceso.Estado === 1 || proceso.Estado === 1026 ? 'Suspendido' : proceso.Estado === 4 ? 'Zombie' : proceso.Estado === 8 ? 'Detenido' : ''}</td>
                <td>{proceso.RAM}</td>
            </tr>
            {procesoSeleccionado === proceso && proceso.Hijos.length > 0 && renderizarProcesos(proceso.Hijos, true)}
          </React.Fragment>
        );
      });
  };

  return (
    <table class="table table-dark" style={{marginTop:"5%"}}>
      <thead>
        <tr>
          <th>PID</th>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Estado</th>
          <th>Ram %</th>
        </tr>
      </thead>
      <tbody>{renderizarProcesos(datos, false)}</tbody>
    </table>
  );
};

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

const App = () => {
  const [setProcesoSeleccionado] = useState(null);
  const [procesos, setProcesos] = useState([]);
  //const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

  const seleccionarProceso = (proceso) => {
    setProcesoSeleccionado(proceso);
  };

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
    })  
  }, 5000);

  return (
    <div>
        {procesos.length > 0 ?
        (<Arbol datos={procesos} onSeleccionarProceso={seleccionarProceso} />)
        : <p>Cargando...</p>}
    </div>
  );
};

export default App;

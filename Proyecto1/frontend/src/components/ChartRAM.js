import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

// function useInterval(callback, delay) {
//   const savedCallback = useRef();

//   // Recuerda la última función de callback.
//   useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   // Configura el intervalo.
//   useEffect(() => {
//     function tick() {
//       savedCallback.current();
//     }

//     if (delay !== null) {
//       let id = setInterval(tick, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// }

function PieChartRAM(props) {
  const [datos, setDatos] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      fetch(`/api/ram`, {
        method: 'GET',
      })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        setDatos(response.datos);
      })
    }, 500);
  });

  const data = {
    labels: ['En Uso', 'Libre'],
    datasets: [
      {
        label: 'Ram (Bytes)',
        data: [datos.uso, datos.libre],
        backgroundColor: [
          'rgba(245, 77, 14, 0.7)',
          'rgba(29, 245, 202, 0.7)',
        ],
        borderColor: [
          'rgba(245, 77, 14, 1)',
          'rgba(29, 245, 202, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <><h1>RAM</h1><div className="divpie">
      <h3>{(datos.uso * 100 / datos.total).toFixed(2)}% en uso</h3>
      <Pie data={data} />
    </div></>
  );
}

export default PieChartRAM;

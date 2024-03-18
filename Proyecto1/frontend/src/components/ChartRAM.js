import React, { useEffect, useState } from 'react';
//import Chart from 'chart.js';
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
      fetch(`http://localhost:5000/ram`, {
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

// function PieChartRAM(props) {
//   const chartRef = useRef();
//   const [data, setData] = useState([0, 0]);
//   const [texto, setTexto] = useState('RAM');

//   useEffect(() => {
//     const myChartRef = chartRef.current.getContext('2d');
//     new Chart(myChartRef, {
//       type: 'pie',
//       data: {
//         labels: ['Utilizado', 'Libre'],
//         datasets: [
//           {
//             data: data,
//             backgroundColor: ['#F7F175', '#ccc'],
//             hoverBackgroundColor: ['#F7F175', '#ccc'],
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         legend: {
//           position: 'bottom',
//         },
//         tooltips: {
//           callbacks: {
//             label: function(tooltipItem, data) {
//               var value = data.datasets[0].data[tooltipItem.index];
//               return value.toString() + "%";
//             }
//           }
//         },
//       },
//     });
//   }, [data]);

//   useInterval(() => {
//     fetch(`http://34.16.131.165:5000/ram`, {
//       method: 'GET',
//     })
//       .then(res => res.json())
//       .catch(err => {
//         console.error('Error:', err)
//         //alert("Ocurrio un error, ver la consola")
//     })
//       .then(response => {
//         setData([response.ram, 100-response.ram]);
//         setTexto('RAM ' + response.ram + "%")
//     })  
//   }, 2000);

//   return (
//     <div>
//       <h2>{texto}</h2>
//       <canvas id="myChart" ref={chartRef} />
//     </div>
//   );
// }

export default PieChartRAM;

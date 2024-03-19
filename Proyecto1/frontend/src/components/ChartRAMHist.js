import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

function HistRAM(props){
  const [datos, setDatos] = useState('');

  useEffect(() => {
    setTimeout(() => {
      fetch(`http://localhost:5000/hist`, {
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
    }, 1000);
  });

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
      scales: {
        y:
          {
            min: 0,
            max: 100,
            position: 'right',
          },
      },
      responsive: true,
      plugins: {
          legend: {
              position: 'top',
          },
          title: {
              display: false,
              text: 'Uso de RAM Histórico',
          },
      },
  };
  var arra = [];
  if(Array.isArray(datos.ram)){
    arra = datos.ram.map((value, index, array) => array[array.length - 1 - index]);
  }
  const data = {
    labels: ['30s','27s','24s','21s', '18s', '15s', '12s', '9s', '6s', '3s'],
    datasets: [
      {
        label: 'Uso de RAM (%)',
        data: arra,
        borderColor: 'rgba(245, 77, 14)',
        backgroundColor: 'rgba(245, 77, 14, 0.7)',
      },
    ],
  };
  return <Line options={options} data={data} />;
}

export default HistRAM;
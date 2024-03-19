import React, { useEffect, useState } from 'react';
//import Chart from 'chart.js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

function PieChartCPU(props) {
  const [datos, setDatos] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      fetch(`http://localhost:5000/cpu`, {
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
        
    }, 1010);
  });

  const data = {
    labels: ['En Uso', 'Libre'],
    datasets: [
      {
        label: 'CPU (%)',
        data: [datos.uso, datos.libre],
        backgroundColor: [
          'rgba(75, 54, 250, 0.7)',
          'rgba(250, 222, 55, 0.7)',
        ],
        borderColor: [
          'rgba(75, 54, 250, 0.1)',
          'rgba(250, 222, 55, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <><h1>CPU</h1><div className="divpie">
      <h3>{datos.uso}% en uso</h3>
      <Pie data={data} />
    </div></>
  );
}

export default PieChartCPU;

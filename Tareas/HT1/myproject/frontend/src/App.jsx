import { useState } from 'react';
import './App.css';
import { Ram } from "../wailsjs/go/main/App";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React, { useEffect } from 'react';
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [datos, setDatos] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      Ram().then((result) => {
        setDatos(JSON.parse(result))
        console.log("uso:",datos.uso, "libre:",datos.libre);
      });
    }, 500);
  });

  const data = {
    labels: ['En Uso', 'Libre'],
    datasets: [
      {
        label: 'Ram (Bytes)',
        data: [datos.uso, datos.libre],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div id="App">
      <h1>RAM</h1>
      <div className = "divpie">
        <h3>{(datos.uso*100/datos.total).toFixed(2)}% en uso</h3>
        <Pie data={data} /> 
      </div>
         
    </div>
  )
}

export default App
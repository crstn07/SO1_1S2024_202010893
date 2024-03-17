import './App.css';
import PieChartCPU from './components/ChartCPU.js';
import PieChartRAM from './components/ChartRAM.js';
import Arbol from './components/Procesos.js'
import ProcesosTabla from './components/CProcesos';

function App() {
  return (
    <div className="App">
      <div class="container">
        <div class="box">
          
          <PieChartCPU />
        </div>
        <div class="box">
          
          <PieChartRAM />
        </div>
      </div>
      <div class="procesos">
        <h1>Procesos</h1>
        <ProcesosTabla/>
        <Arbol/>
      </div>     
    </div>
  );
}

export default App;

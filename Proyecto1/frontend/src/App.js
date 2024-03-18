import './App.css';
import PieChartCPU from './components/ChartCPU.js';
import PieChartRAM from './components/ChartRAM.js';
//import Arbol from './components/Procesos.js'
//import ProcesosTabla from './components/CProcesos';

function App() {
  return (
    <div className="App">
      <div className="d-flex align-items-start">
        <div className="nav flex-column nav-pills me-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <button className="nav-link active" id="v-pills-real-tab" data-bs-toggle="pill" data-bs-target="#v-pills-real" type="button" role="tab" aria-controls="v-pills-real" aria-selected="true">Monitoreo Tiempo Real</button>
          <button className="nav-link" id="v-pills-historico-tab" data-bs-toggle="pill" data-bs-target="#v-pills-historico" type="button" role="tab" aria-controls="v-pills-historico" aria-selected="false">Monitoreo Histórico</button>
          <button className="nav-link" id="v-pills-tree-tab" data-bs-toggle="pill" data-bs-target="#v-pills-tree" type="button" role="tab" aria-controls="v-pills-tree" aria-selected="false" >Disabled</button>
          <button className="nav-link" id="v-pills-simulation-tab" data-bs-toggle="pill" data-bs-target="#v-pills-simulation" type="button" role="tab" aria-controls="v-pills-simulation" aria-selected="false">Messages</button>
        </div>
        <div className="tab-content" id="v-pills-tabContent">
          <div className="tab-pane fade show active" id="v-pills-real" role="tabpanel" aria-labelledby="v-pills-real-tab" tabindex="0">          
            <h1>Monitoreo en Tiempo Real</h1>
            <div className="box">
              <PieChartCPU />
            </div>
            <div className="box">
              <PieChartRAM />
            </div>            
          </div>
          <div className="tab-pane fade" id="v-pills-historico" role="tabpanel" aria-labelledby="v-pills-historico-tab" tabindex="0">...</div>
          <div className="tab-pane fade" id="v-pills-tree" role="tabpanel" aria-labelledby="v-pills-tree-tab" tabindex="0">...</div>
          <div className="tab-pane fade" id="v-pills-simulation" role="tabpanel" aria-labelledby="v-pills-simulation-tab" tabindex="0">...</div>
        </div>
      </div>
      
      {/* <div className="procesos">
        <h1>Procesos</h1>
        <ProcesosTabla/>
        <Arbol/>
      </div>      */}
    </div>
  );
}

export default App;

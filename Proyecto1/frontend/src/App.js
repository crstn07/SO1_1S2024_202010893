import './App.css';
import PieChartCPU from './components/ChartCPU.js';
import PieChartRAM from './components/ChartRAM.js';
import HistCPU from './components/ChartCPUHist.js';
import HistRAM from './components/ChartRAMHist.js';
import ArbolProcesos from './components/Procesos.js';
import Simulacion from './components/Simulacion.js';

function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">SO1-Proyecto1-202010893</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          </button>
            <div className="nav nav-pills me-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
              <button className="nav-link active" id="v-pills-real-tab" data-bs-toggle="pill" data-bs-target="#v-pills-real" type="button" role="tab" aria-controls="v-pills-real" aria-selected="true">Monitoreo en Tiempo Real</button>
              <button className="nav-link" id="v-pills-historico-tab" data-bs-toggle="pill" data-bs-target="#v-pills-historico" type="button" role="tab" aria-controls="v-pills-historico" aria-selected="false">Monitoreo Histórico</button>
              <button className="nav-link" id="v-pills-tree-tab" data-bs-toggle="pill" data-bs-target="#v-pills-tree" type="button" role="tab" aria-controls="v-pills-tree" aria-selected="false" > Árbol de Procesos</button>
              <button className="nav-link" id="v-pills-simulation-tab" data-bs-toggle="pill" data-bs-target="#v-pills-simulation" type="button" role="tab" aria-controls="v-pills-simulation" aria-selected="false">Simulación de Procesos</button>
            </div>
        </div>
      </nav>
      <div className="d-flex align-items-start">
        <div className="tab-content" id="v-pills-tabContent">
          <div className="tab-pane fade show active" id="v-pills-real" role="tabpanel" aria-labelledby="v-pills-real-tab" tabIndex="0">          
            <div className="box">
              <PieChartCPU />
            </div>
            <div className="box">
              <PieChartRAM />
            </div>            
          </div>
          <div className="tab-pane fade" id="v-pills-historico" role="tabpanel" aria-labelledby="v-pills-historico-tab" tabIndex="0">
            <div className="box2">
              <h1>CPU</h1>
              <HistCPU />
            </div>
            <div className="box2">
              <h1>RAM</h1>
              <HistRAM />
            </div>
          </div>
          <div className="tab-pane fade" id="v-pills-tree" role="tabpanel" aria-labelledby="v-pills-tree-tab" tabIndex="0">
            <h1>Árbol de Procesos</h1>
            <ArbolProcesos/>
          </div>
          <div className="tab-pane fade" id="v-pills-simulation" role="tabpanel" aria-labelledby="v-pills-simulation-tab" tabIndex="0">
            <Simulacion/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

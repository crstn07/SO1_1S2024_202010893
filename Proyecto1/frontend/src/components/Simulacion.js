
import React, { useState } from 'react';

function Simulacion() {
    const [pid, setPID] = useState('');

    async function nuevo() {
        fetch(`/api/nuevo`, {
            method: 'GET',
        })
            .then(res => res.json())
            .catch(err => {
                console.error('Error:', err)
                alert("Error")
            })
            .then(response => {
                alert("Proceso iniciado con PID: " + response.pid + " y estado en espera")
                setPID(response.pid)
            })
    }

    async function matar() {
        fetch(`/api/matar?pid=${pid}`, {
            method: 'GET',
        })
            .then(res => res.json())
            .catch(err => {
                console.error('Error:', err)
                alert("Error")
            })
            .then(response => {
                alert(response.mensaje)
            })
    }

    async function parar() {
        fetch(`/api/parar?pid=${pid}`, {
            method: 'GET',
        })
            .then(res => res.json())
            .catch(err => {
                console.error('Error:', err)
                alert("Error")
            })
            .then(response => {
                alert(response.mensaje)
            })
    }
    async function resumir() {
        fetch(`/api/resumir?pid=${pid}`, {
            method: 'GET',
        })
            .then(res => res.json())
            .catch(err => {
                console.error('Error:', err)
                alert("Error")
            })
            .then(response => {
                alert(response.mensaje)
            })
    }
    return (
        <div>
            <button className="btn btn-success " style={{ marginRight: '10px' }} onClick={nuevo}>New</button>
            <button className="btn btn-warning " style={{ marginRight: '10px' }} onClick={parar}>Stop</button>
            <button className="btn btn-danger " style={{ marginRight: '10px' }} onClick={matar}>Kill</button>
            <button className="btn btn-info " style={{ marginRight: '10px' }} onClick={resumir}>Resume</button>
        </div>
    );
}

export default Simulacion;
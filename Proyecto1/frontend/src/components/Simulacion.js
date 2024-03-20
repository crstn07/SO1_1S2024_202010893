
import React, { useState } from 'react';
import Graph from 'graphviz-react';

function Simulacion() {
    const [pid, setPID] = useState('');
    const [dot, setDot] = useState('digraph G {\nbgcolor="transparent"}');
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
        
        const newdot = ['digraph G {\nbgcolor="transparent" node [style=filled, fillcolor=cyan];rankdir=LR; edge [color=lightblue]'];
        newdot.push('new\n')
        newdot.push('ready\n')
        newdot.push('running [fillcolor=green]\n')
        newdot.push('new -> ready [arrowhead=false]')
        newdot.push('ready -> running [arrowhead=false]')
        newdot.push('}')
        setDot(newdot.join('\n'))
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
                setPID('')
            })

        const newdot = ['digraph G {\nbgcolor="transparent" node [style=filled, fillcolor=cyan];rankdir=LR; edge [color=lightblue]'];
        newdot.push('new\n')
        newdot.push('ready\n')
        newdot.push('running\n')
        newdot.push('terminated [fillcolor=green]\n')
        newdot.push('new -> ready [arrowhead=false]')
        newdot.push('ready -> running [arrowhead=false]')
        newdot.push('running -> terminated [color=green]')

        newdot.push('}')
        setDot(newdot.join('\n'))
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
        const newdot = ['digraph G {\nbgcolor="transparent" node [style=filled, fillcolor=cyan];rankdir=LR; edge [color=lightblue]'];
        newdot.push('new\n')
        newdot.push('ready [fillcolor=green]\n')
        newdot.push('running\n')
        newdot.push('new -> ready [arrowhead=false]')
        newdot.push('running -> ready [color=red]')
        newdot.push('ready -> running [arrowhead=false]')
        newdot.push('}')
        setDot(newdot.join('\n'))
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
        
        const newdot = ['digraph G {\nbgcolor="transparent" node [style=filled, fillcolor=cyan];rankdir=LR; edge [color=lightblue]'];
        newdot.push('new\n')
        newdot.push('ready\n')
        newdot.push('running [fillcolor=green]\n')
        newdot.push('new -> ready [arrowhead=false]')
        newdot.push('ready -> running [color=green]')
        newdot.push('running -> ready [arrowhead=false]')
        newdot.push('}')
        setDot(newdot.join('\n'))
    }
    return (
        <div>
            <h4>PID: {pid}</h4>
            <button className="btn btn-success " style={{ marginRight: '10px' }} onClick={nuevo}>New</button>
            <button className="btn btn-warning " style={{ marginRight: '10px' }} onClick={parar}>Stop</button>
            <button className="btn btn-info " style={{ marginRight: '10px' }} onClick={resumir}>Resume</button>
            <button className="btn btn-danger " style={{ marginRight: '10px' }} onClick={matar}>Kill</button>
            <Graph
                dot={dot}
                options={{zoom:true, height: 400, width: 1200 }}
            />
        </div>
    );
}

export default Simulacion;
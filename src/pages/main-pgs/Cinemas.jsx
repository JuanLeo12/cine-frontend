// src/pages/Cinemas.jsx
import React, { useState } from 'react';
import CinemaCard from '../../components/comp/CinemaCard';
import { sedes } from '../../data/mockData';
import './css/Cinemas.css';

function Cinemas() {
    const [filtroCiudad, setFiltroCiudad] = useState('Todas');
    const ciudades = ['Todas', ...new Set(sedes.map(s => s.ciudad))];

    const sedesFiltradas = filtroCiudad === 'Todas'
        ? sedes
        : sedes.filter(s => s.ciudad === filtroCiudad);

    return (
        <div className="cinemas">
            <div className="filters">
                <h3>Filtrar por ciudad</h3>
                <select onChange={(e) => setFiltroCiudad(e.target.value)} value={filtroCiudad}>
                    {ciudades.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="cinema-grid">
                {sedesFiltradas.map(sede => (
                    <CinemaCard key={sede.id} sede={sede} />
                ))}
            </div>
        </div>
    );
}

export default Cinemas;
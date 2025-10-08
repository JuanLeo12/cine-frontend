import React from 'react';
import './css/CinemaCard.css';

function CinemaCard({ sede }) {
    return (
        <div className="cinema-card">
            <img src={sede.imagen} alt={sede.nombre} />
            <h3>{sede.nombre}</h3>
            <p>{sede.direccion}</p>
            <button>Ver Funciones</button>
        </div>
    );
}

export default CinemaCard;
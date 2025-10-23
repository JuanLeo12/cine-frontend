import React from 'react';
import './css/CinemaCard.css';

function CinemaCard({ sede }) {
    return (
        <div className="cinema-card">
            <img 
                src={sede.imagen || "https://via.placeholder.com/400x300?text=Cine"} 
                alt={sede.nombre} 
            />
            <h3>{sede.nombre}</h3>
            <p><strong>📍</strong> {sede.direccion}</p>
            <p><strong>🏙️</strong> {sede.ciudad}</p>
            <p><strong>📞</strong> {sede.telefono}</p>
            {sede.Salas && sede.Salas.length > 0 && (
                <p className="salas-info">🎭 {sede.Salas.length} salas disponibles</p>
            )}
        </div>
    );
}

export default CinemaCard;
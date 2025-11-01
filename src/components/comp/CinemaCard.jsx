import React from 'react';
import './css/CinemaCard.css';

function CinemaCard({ sede }) {
    return (
        <div className="cinema-card">
            <img 
                src={sede.imagen_url || "https://via.placeholder.com/400x300?text=Cine"} 
                alt={sede.nombre} 
            />
            <h3>{sede.nombre}</h3>
            <p><strong>📍</strong> {sede.direccion}</p>
            <p><strong>🏙️</strong> {sede.ciudad}</p>
            <p><strong>📞</strong> {sede.telefono || 'Sin teléfono'}</p>
            {sede.salas && sede.salas.length > 0 && (
                <p className="salas-info">🎭 {sede.salas.length} salas disponibles</p>
            )}
        </div>
    );
}

export default CinemaCard;
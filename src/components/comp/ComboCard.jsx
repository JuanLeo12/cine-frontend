import React from 'react';
import './css/ComboCard.css';

function ComboCard({ combo }) {
    return (
        <div className="combo-card">
            <img src={combo.imagen_url || combo.imagen} alt={combo.nombre} />
            <h3>{combo.nombre}</h3>
            <p>{combo.descripcion}</p>
            <p className="precio">S/ {parseFloat(combo.precio).toFixed(2)}</p>
            <button>Agregar al Carrito</button>
        </div>
    );
}

export default ComboCard;
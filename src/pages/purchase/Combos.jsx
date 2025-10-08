import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComboCard from '../../components/comp/ComboCard';
import { combos } from '../../data/mockData';
import './css/Combos.css';

function Combos() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedSeats, ticketTypes } = location.state || {};

    const [cart, setCart] = useState([]);

    const addToCart = (combo) => {
        const existing = cart.find(c => c.id === combo.id);
        if (existing) {
            setCart(cart.map(c => c.id === combo.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...combo, quantity: 1 }]);
        }
    };

    const handleContinue = () => {
        navigate('/payment', { state: { selectedSeats, ticketTypes, cart } });
    };

    return (
        <div className="combos-page">
            <h2>Agrega combos (opcional)</h2>
            <div className="combo-grid">
                {combos.map(combo => (
                    <div key={combo.id} className="combo-card-wrapper">
                        <ComboCard combo={combo} />
                        <button onClick={() => addToCart(combo)}>Agregar</button>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <h3>Carrito</h3>
                {cart.length === 0 ? <p>No hay combos agregados</p> : (
                    <ul>
                        {cart.map(item => (
                            <li key={item.id}>
                                {item.nombre} x{item.quantity} - S/. {(item.precio * item.quantity).toFixed(2)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button className="continue-btn" onClick={handleContinue}>
                Continuar al Pago
            </button>
        </div>
    );
}

export default Combos;
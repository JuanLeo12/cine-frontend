import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tiposEntrada, metodosPago } from '../../data/mockData';
import './css/Payment.css';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedSeats, ticketTypes, cart } = location.state || {};

    const [metodo, setMetodo] = useState('tarjeta');
    const [formData, setFormData] = useState({
        numero: '',
        nombre: '',
        exp: '',
        cvv: '',
        telefono: ''
    });

    const subtotal = ticketTypes.reduce((acc, t) => {
        const tipo = tiposEntrada.find(tt => tt.id === t.tipo);
        return acc + (tipo?.precio || 0);
    }, 0);
    const totalCombos = cart.reduce((acc, c) => acc + (c.precio * c.quantity), 0);
    const total = subtotal + totalCombos;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulación de procesamiento
        setTimeout(() => {
            navigate('/confirmation', { state: { selectedSeats, ticketTypes, cart, metodo, total } });
        }, 3000);
    };

    return (
        <div className="payment-page">
            <h2>Forma de Pago</h2>
            <div className="payment-info">
                <p><strong>Total:</strong> S/. {total.toFixed(2)}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="payment-method">
                    <label>Método de Pago</label>
                    <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                        {metodosPago.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                {metodo === 'tarjeta' && (
                    <div className="payment-form">
                        <input type="text" placeholder="Número de tarjeta" required />
                        <input type="text" placeholder="Nombre en la tarjeta" required />
                        <input type="text" placeholder="MM/AA" required />
                        <input type="text" placeholder="CVV" required />
                    </div>
                )}

                {metodo === 'yape' && (
                    <div className="payment-form">
                        <input type="text" placeholder="Número de celular" required />
                    </div>
                )}

                <button type="submit" className="pay-btn">
                    Pagar
                </button>
            </form>
        </div>
    );
}

export default Payment;
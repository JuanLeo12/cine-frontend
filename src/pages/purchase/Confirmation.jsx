import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tiposEntrada, metodosPago } from '../../data/mockData'; 
import './css/Confirmation.css';

function Confirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedSeats, ticketTypes, cart, metodo, total } = location.state || {};

    const transactionId = `TX-${Date.now()}`;

    const handleNewPurchase = () => {
        navigate('/');
    };

    return (
        <div className="confirmation">
            <h2>¡Compra realizada con éxito!</h2>
            <div className="ticket-summary">
                <h3>Resumen de Compra</h3>
                <p><strong>ID de Transacción:</strong> {transactionId}</p>
                <p><strong>Asientos:</strong> {selectedSeats.join(', ')}</p>
                <p><strong>Entradas:</strong></p>
                <ul>
                    {ticketTypes.map((t, i) => {
                        const tipo = tiposEntrada.find(tt => tt.id === t.tipo);
                        return <li key={i}>{t.id}: {tipo?.nombre || 'General'} - S/. {tipo?.precio || 0}</li>;
                    })}
                </ul>
                {cart.length > 0 && (
                    <>
                        <p><strong>Combos:</strong></p>
                        <ul>
                            {cart.map(c => <li key={c.id}>{c.nombre} x{c.quantity} - S/. {(c.precio * c.quantity).toFixed(2)}</li>)}
                        </ul>
                    </>
                )}
                <p><strong>Total Pagado:</strong> S/. {total.toFixed(2)}</p>
                <p><strong>Método de Pago:</strong> {metodosPago.find(m => m.id === metodo)?.nombre || 'Tarjeta'}</p>
            </div>
            <button className="new-purchase-btn" onClick={handleNewPurchase}>
                Nueva Compra
            </button>
        </div>
    );
}

export default Confirmation;
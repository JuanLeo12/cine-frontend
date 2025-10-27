import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePurchase } from '../../context/PurchaseContext';
import './css/Confirmation.css';

function Confirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { stopTimer, clearPurchase, setHasActiveSelection } = usePurchase();
    
    const { orden, pago, pelicula, funcion, selectedSeats, tickets, cart } = location.state || {};

    // Detener timer cuando se complete la compra
    useEffect(() => {
        stopTimer();
        clearPurchase();
        setHasActiveSelection(false);
    }, [stopTimer, clearPurchase, setHasActiveSelection]);

    if (!orden || !pago) {
        return (
            <div className="confirmation">
                <div className="error-message">
                    <h2>⚠️ Error</h2>
                    <p>No se encontró información de la orden</p>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    const handleNewPurchase = () => {
        navigate('/movies');
    };

    const handleViewOrders = () => {
        navigate('/mis-compras');
    };

    // Generar URL del código QR único para la orden (con combos y tickets detallados)
    const generarQR = (ordenId) => {
        const datosQR = {
            orden: ordenId,
            pelicula: pelicula?.titulo || null,
            funcion: funcion?.id || null,
            asientos: (selectedSeats || []).map(s => s.id).join(',') || null,
            tickets: (tickets || []).map(t => `${t.tipo_nombre || 'Ticket'}:${t.cantidad}`).join(',') || null,
            combos: (cart || []).length > 0 ? (cart || []).map(c => `${c.nombre}:${c.quantity}`).join(',') : null,
            fecha: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
        };
        const qrData = encodeURIComponent(JSON.stringify(datosQR));
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;
    };

    return (
        <div className="confirmation">
            <div className="confirmation-header">
                <div className="success-icon">✓</div>
                <h2>¡Compra Exitosa!</h2>
                <p className="success-message">Tu pago ha sido procesado correctamente</p>
            </div>

            <div className="confirmation-container">
                {/* Código QR ÚNICO para toda la orden */}
                <div className="qr-section-confirmation">
                    <h3>📱 Código QR de tu Compra</h3>
                    <div className="qr-container-confirmation">
                        <img 
                            src={generarQR(orden.id)} 
                            alt={`QR Orden ${orden.id}`}
                            className="qr-code-confirmation"
                        />
                        <p className="qr-text">
                            <strong>Presenta este código al ingresar</strong><br/>
                            Orden #{orden.id}
                        </p>
                    </div>
                </div>

                {/* Resumen de Orden */}
                <div className="order-details">
                    <h3>📋 Resumen de Orden</h3>
                    
                    <div className="detail-card">
                        <div className="detail-row">
                            <span>Orden ID:</span>
                            <strong>#{orden.id}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Fecha de compra:</span>
                            <strong>{new Date(orden.fecha_compra || Date.now()).toLocaleString('es-PE')}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Estado:</span>
                            <span className="status-badge pagada">{orden.estado}</span>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h4>🎬 Película</h4>
                        <p><strong>{pelicula?.titulo}</strong></p>
                        <p>{pelicula?.genero} • {pelicula?.duracion} min</p>
                    </div>

                    <div className="detail-card">
                        <h4>💺 Asientos</h4>
                            <div className="seats-grid">
                            {(selectedSeats || []).map((seat, idx) => (
                                <span key={idx} className="seat-badge">{seat.id}</span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-card">
                        <h4>🎫 Tickets</h4>
                        {(tickets || []).map((ticket, index) => (
                            <div key={index} className="detail-row">
                                <span>{ticket.cantidad}x {ticket.tipo_nombre || 'Ticket'}</span>
                                <span>S/ {(ticket.cantidad * ticket.precio_unitario).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {cart && cart.length > 0 && (
                        <div className="detail-card">
                            <h4>🍿 Combos</h4>
                            {cart.map((combo, index) => (
                                <div key={index} className="detail-row">
                                    <span>{combo.quantity}x {combo.nombre}</span>
                                    <span>S/ {(combo.quantity * combo.precio).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="detail-row subtotal">
                                <span>Subtotal Combos</span>
                                <strong>S/ {cart.reduce((sum, c) => sum + (c.quantity * c.precio), 0).toFixed(2)}</strong>
                            </div>
                        </div>
                    )}

                    <div className="detail-card payment-info">
                        <div className="detail-row total">
                            <span>Total Pagado</span>
                            <strong>S/ {parseFloat(pago.monto_total).toFixed(2)}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Método de pago</span>
                            <span>💳 {pago.estado_pago}</span>
                        </div>
                        {pago.nota && (
                            <p className="payment-note">{pago.nota}</p>
                        )}
                    </div>

                    <div className="important-info">
                        <h4>⚠️ Importante</h4>
                        <ul>
                            <li>Presenta este código QR en la entrada del cine</li>
                            <li>Llega 15 minutos antes de la función</li>
                            <li>Los asientos están confirmados y reservados</li>
                            <li>No se permiten devoluciones</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="confirmation-actions">
                <button className="secondary-btn" onClick={handleViewOrders}>
                    Ver mis compras
                </button>
                <button className="primary-btn" onClick={handleNewPurchase}>
                    Nueva compra
                </button>
            </div>
        </div>
    );
}

export default Confirmation;
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePurchase } from '../../context/PurchaseContext';
import './css/Confirmation.css';

function Confirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { stopTimer, clearPurchase, setHasActiveSelection } = usePurchase();
    
    const { orden, pago, pelicula, funcion, selectedSeats, tickets } = location.state || {};

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

    // Generar URL del código QR único para la orden
    const generarQR = (ordenId) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDEN-${ordenId}`;
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
                            {selectedSeats.map((seat, idx) => (
                                <span key={idx} className="seat-badge">{seat.id}</span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-card">
                        <h4>🎫 Tickets</h4>
                        {tickets.map((ticket, index) => (
                            <div key={index} className="detail-row">
                                <span>{ticket.cantidad}x Ticket</span>
                                <span>S/ {(ticket.cantidad * ticket.precio_unitario).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

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
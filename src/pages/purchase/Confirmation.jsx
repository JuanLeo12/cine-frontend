import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePurchase } from '../../context/PurchaseContext';
import './css/Confirmation.css';

function Confirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { stopTimer, clearPurchase, setHasActiveSelection } = usePurchase();
    
    const { orden, pago, pelicula, funcion, selectedSeats, tickets, cart, valeAplicado } = location.state || {};

    // DEBUG: Ver qué valores tenemos
    React.useEffect(() => {
        console.log('📊 Confirmation - Datos recibidos:', {
            pago_monto_total: pago?.monto_total,
            orden_monto_total: orden?.monto_total,
            valeAplicado,
            tickets,
            cart
        });
    }, [pago, orden, valeAplicado, tickets, cart]);

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

    // Generar URL del código QR único para la orden (mismo formato que MisCompras)
    const generarQR = (orden) => {
        const tituloPelicula = orden.funcion?.pelicula?.titulo || pelicula?.titulo || 'N/A';
        const fecha = orden.funcion?.fecha || funcion?.fecha || 'N/A';
        const hora = orden.funcion?.hora || funcion?.hora || 'N/A';
        const sala = orden.funcion?.sala?.nombre || funcion?.sala?.nombre || 'N/A';
        const sede = orden.funcion?.sala?.sede?.nombre || funcion?.sala?.sede?.nombre || 'N/A';
        
        // Obtener asientos (mismo formato que MisCompras)
        const asientos = (selectedSeats || []).map(s => s.id);
        
        // Obtener tickets con cantidad y tipo (mismo formato que MisCompras)
        const ticketsData = (tickets || []).map(t => {
            const nombreTipo = t.nombre || 'Ticket';
            const cantidad = t.cantidad;
            return {
                tipo: nombreTipo,
                cantidad: cantidad,
                descripcion: `x${cantidad} Ticket${cantidad > 1 ? 's' : ''} ${nombreTipo}`
            };
        });
        
        // Obtener combos (mismo formato que MisCompras)
        const combosData = (cart || []).map(c => ({
            nombre: c.nombre,
            cantidad: c.quantity
        }));
        
        const total = parseFloat(pago.monto_total);
        const fechaCompraFormateada = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

        const qrData = {
            tipo: "CINESTAR_TICKET",
            orden_id: orden.id,
            pelicula: tituloPelicula,
            funcion: {
                fecha: fecha,
                hora: hora
            },
            ubicacion: {
                sede: sede,
                sala: sala
            },
            asientos: asientos,
            tickets: ticketsData,
            combos: combosData,
            pago: {
                total: parseFloat(total.toFixed(2)),
                estado: pago.estado_pago || 'completado',
                metodo: pago.metodoPago?.nombre || 'N/A' // ← Método correcto
            },
            fecha_compra: fechaCompraFormateada,
            cliente: orden.usuario?.nombre || 'N/A' // ← Cliente correcto
        };
        
        // Convertir a JSON con formato legible
        const jsonData = JSON.stringify(qrData, null, 2);
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonData)}`;
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
                            src={generarQR(orden)} 
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
                        {(tickets || []).length === 0 ? (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>Sin tickets</p>
                        ) : (
                            <div className="tickets-list-simple">
                                {(tickets || []).map((ticket, index) => (
                                    <div key={index} className="ticket-line-simple">
                                        <span className="ticket-bullet-confirm">•</span>
                                        <span className="ticket-text-confirm">
                                            <strong>x{ticket.cantidad}</strong> Ticket{ticket.cantidad > 1 ? 's' : ''} <strong>{ticket.nombre || 'General'}</strong>
                                        </span>
                                        <span className="ticket-price-confirm">
                                            S/ {(ticket.cantidad * ticket.precio_unitario).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        {(() => {
                            // Calcular subtotal original (tickets + combos)
                            const subtotalTickets = (tickets || []).reduce((sum, t) => sum + (t.cantidad * t.precio_unitario), 0);
                            const subtotalCombos = (cart || []).reduce((sum, c) => sum + (c.quantity * c.precio), 0);
                            
                            // Calcular subtotal solo de combos tipo "combos" (no popcorn ni bebidas)
                            const subtotalCombosDescuento = (cart || [])
                                .filter(c => c.tipo === 'combos')
                                .reduce((sum, c) => sum + (c.quantity * c.precio), 0);
                            
                            const subtotalOriginal = subtotalTickets + subtotalCombos;
                            
                            // Si hay vale, calcular descuento
                            if (valeAplicado) {
                                const porcentaje = valeAplicado.valor || 20;
                                let descuento = 0;
                                
                                if (valeAplicado.tipo === 'entrada') {
                                    descuento = subtotalTickets * (porcentaje / 100);
                                } else if (valeAplicado.tipo === 'combo') {
                                    // Descuento solo aplica a combos tipo "combos"
                                    descuento = subtotalCombosDescuento * (porcentaje / 100);
                                }
                                
                                const totalCalculado = subtotalOriginal - descuento;
                                
                                return (
                                    <>
                                        <div className="detail-row">
                                            <span>Subtotal</span>
                                            <strong>S/ {subtotalOriginal.toFixed(2)}</strong>
                                        </div>
                                        <div className="detail-row discount">
                                            <span>💎 Descuento Vale ({porcentaje}% en {valeAplicado.tipo === 'entrada' ? 'Tickets' : 'Combos'})</span>
                                            <strong style={{ color: '#27ae60' }}>- S/ {descuento.toFixed(2)}</strong>
                                        </div>
                                        <div className="detail-row total">
                                            <span>Total Pagado</span>
                                            <strong>S/ {totalCalculado.toFixed(2)}</strong>
                                        </div>
                                    </>
                                );
                            } else {
                                // Sin vale, mostrar solo total
                                return (
                                    <div className="detail-row total">
                                        <span>Total Pagado</span>
                                        <strong>S/ {subtotalOriginal.toFixed(2)}</strong>
                                    </div>
                                );
                            }
                        })()}
                        <div className="detail-row">
                            <span>Método de pago</span>
                            <span>💳 {pago.metodoPago?.nombre || 'No especificado'}</span>
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
import React, { useState, useEffect } from 'react';
import { getOrdenesUsuario } from '../../services/api';
import './css/MisCompras.css';

function MisCompras() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordenExpandida, setOrdenExpandida] = useState(null);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            const data = await getOrdenesUsuario();
            setOrdenes(data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularTotal = (orden) => {
        // Si tiene monto_total guardado, usarlo
        if (orden.monto_total && orden.monto_total > 0) {
            return Number(orden.monto_total);
        }

        // Si no, calcular desde tickets y combos
        let total = 0;

        // Sumar tickets
        if (orden.ordenTickets && orden.ordenTickets.length > 0) {
            orden.ordenTickets.forEach(ot => {
                total += Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1);
            });
        }

        // Sumar combos
        if (orden.ordenCombos && orden.ordenCombos.length > 0) {
            orden.ordenCombos.forEach(oc => {
                total += Number(oc.precio_unitario || 0) * Number(oc.cantidad || 0);
            });
        }

        return total;
    };

    const toggleOrden = (ordenId) => {
        setOrdenExpandida(ordenExpandida === ordenId ? null : ordenId);
    };

    const generarQR = (ticketId) => {
        // Generar código QR usando una API pública
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKET-${ticketId}`;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando compras...</div>;
    }

    return (
        <div className="mis-compras">
            {/* Header para impresión */}
            <div className="print-header">
                <img src="/logo.png" alt="CineStar" className="print-logo" />
                <h1 className="print-title">CineStar</h1>
                <p className="print-subtitle">Comprobante de Compra</p>
            </div>

            <h2>Mis Compras</h2>
            {ordenes.length === 0 ? (
                <p>No tienes compras registradas aún.</p>
            ) : (
                <div className="compras-list">
                    {ordenes.map(orden => {
                        const total = calcularTotal(orden);
                        const isExpanded = ordenExpandida === orden.id;

                        return (
                            <div key={orden.id} className="compra-card">
                                {/* Información del cliente para impresión */}
                                <div className="print-cliente-info">
                                    <p><strong>Cliente:</strong> {orden.usuario?.nombre || 'N/A'}</p>
                                    <p><strong>Email:</strong> {orden.usuario?.email || 'N/A'}</p>
                                </div>

                                <div className="compra-header" onClick={() => toggleOrden(orden.id)}>
                                    <div>
                                        <h3>Orden #{orden.id}</h3>
                                        <p className="fecha">{new Date(orden.fecha_compra).toLocaleString('es-PE', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div className="compra-summary">
                                        <span className={`estado estado-${orden.estado}`}>
                                            {orden.estado}
                                        </span>
                                        <p className="total-preview">S/ {total.toFixed(2)}</p>
                                        <button className="btn-expand">
                                            {isExpanded ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="compra-details">
                                        {/* Información de la Función y Película */}
                                        {orden.funcion && (
                                            <div className="seccion-detalle seccion-funcion">
                                                <h4>🎬 Información de la Función</h4>
                                                <div className="info-funcion">
                                                    <p><strong>Película:</strong> {orden.funcion.pelicula?.titulo || 'N/A'}</p>
                                                    <p><strong>Fecha de función:</strong> {(() => {
                                                        const fecha = new Date(orden.funcion.fecha + 'T00:00:00');
                                                        return fecha.toLocaleDateString('es-PE', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        });
                                                    })()}</p>
                                                    <p><strong>Hora:</strong> {orden.funcion.hora}</p>
                                                    <p><strong>Sede:</strong> {orden.funcion.sala?.sede?.nombre || 'N/A'}</p>
                                                    <p><strong>Sala:</strong> {orden.funcion.sala?.nombre || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tickets y Asientos */}
                                        {orden.ordenTickets && orden.ordenTickets.length > 0 && (
                                            <div className="seccion-detalle">
                                                <h4>🎫 Tickets y Asientos</h4>
                                                {orden.ordenTickets.map((ot) => (
                                                    <div key={ot.id} className="orden-ticket-item">
                                                        <div className="ticket-info">
                                                            <p><strong>Tipo:</strong> {ot.tipoTicket?.nombre || 'Ticket'}</p>
                                                            <p><strong>Cantidad:</strong> {ot.cantidad}</p>
                                                            <p><strong>Precio unitario:</strong> S/ {Number(ot.precio_unitario || 0).toFixed(2)}</p>
                                                            <p><strong>Subtotal:</strong> S/ {(Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1)).toFixed(2)}</p>
                                                        </div>

                                                        {/* Asientos compactos */}
                                                        {ot.tickets && ot.tickets.length > 0 && (
                                                            <div className="asientos-compactos">
                                                                <p><strong>Asientos:</strong></p>
                                                                <div className="asientos-badges-row">
                                                                    {ot.tickets.map((ticket) => (
                                                                        <span key={ticket.id} className="asiento-badge-small">
                                                                            {ticket.asientoFuncion ? 
                                                                                `${ticket.asientoFuncion.fila}${ticket.asientoFuncion.numero}` : 
                                                                                'N/A'
                                                                            }
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Combos */}
                                        {orden.ordenCombos && orden.ordenCombos.length > 0 && (
                                            <div className="seccion-detalle">
                                                <h4>🍿 Combos</h4>
                                                <ul className="combos-list">
                                                    {orden.ordenCombos.map((oc) => (
                                                        <li key={oc.id}>
                                                            <span><strong>{oc.combo?.nombre || 'N/A'}</strong></span>
                                                            <span>x{oc.cantidad}</span>
                                                            <span>S/ {(Number(oc.precio_unitario) * Number(oc.cantidad)).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Resumen de Pago */}
                                        <div className="seccion-detalle resumen-pago">
                                            <h4>💰 Resumen de Pago</h4>
                                            <div className="linea-total">
                                                <span className="label-total">Total Pagado:</span>
                                                <span className="valor-total">S/ {total.toFixed(2)}</span>
                                            </div>
                                            {orden.pago && (
                                                <div className="info-pago">
                                                    <p className="metodo-pago">
                                                        <strong>Método de pago:</strong> {orden.pago.metodoPago?.nombre || 'No especificado'}
                                                    </p>
                                                    <p className="metodo-pago">
                                                        <strong>Fecha de pago:</strong> {orden.pago.fecha_pago ? 
                                                            new Date(orden.pago.fecha_pago).toLocaleString('es-PE') : 
                                                            'N/A'
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className={`estado-pago estado-${orden.pago.estado_pago}`}>
                                                            Estado: {orden.pago.estado_pago.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Code ÚNICO para toda la orden */}
                                        <div className="seccion-qr-compra">
                                            <h4>📱 Código QR de la Compra</h4>
                                            <div className="qr-wrapper">
                                                <img 
                                                    src={generarQR(orden.id)} 
                                                    alt={`QR Orden ${orden.id}`}
                                                    title="Escanea este código al ingresar al cine"
                                                    className="qr-code-imagen"
                                                />
                                                <div className="qr-info-texto">
                                                    <p className="qr-titulo">Presenta este código al ingresar</p>
                                                    <p className="qr-orden">Orden #{orden.id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de acción */}
                                        <div className="acciones-compra">
                                            <button 
                                                className="btn-comprobante"
                                                onClick={() => window.print()}
                                            >
                                                🖨️ Imprimir Comprobante
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MisCompras;

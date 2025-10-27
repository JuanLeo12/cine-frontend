import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrdenesUsuario } from '../../services/api';
import './css/MisCompras.css';

function MisCompras() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordenExpandida, setOrdenExpandida] = useState(null);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            const data = await getOrdenesUsuario();
            console.log('🛒 Órdenes recibidas:', data);
            console.log('🛒 Total de órdenes:', data.length);
            console.log('🛒 IDs únicos:', [...new Set(data.map(o => o.id))]);
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

    const generarQR = (orden) => {
        // Construir información completa para el QR en formato JSON
        const pelicula = orden.funcion?.pelicula?.titulo || 'N/A';
        const fecha = orden.funcion?.fecha || 'N/A';
        const hora = orden.funcion?.hora || 'N/A';
        const sala = orden.funcion?.sala?.nombre || 'N/A';
        const sede = orden.funcion?.sala?.sede?.nombre || 'N/A';
        
        // Obtener asientos
        const asientos = [];
        if (orden.ordenTickets) {
            orden.ordenTickets.forEach(ot => {
                if (ot.tickets) {
                    ot.tickets.forEach(ticket => {
                        if (ticket.asientoFuncion) {
                            asientos.push(`${ticket.asientoFuncion.fila}${ticket.asientoFuncion.numero}`);
                        }
                    });
                }
            });
        }
        
        const total = calcularTotal(orden);
        
        // Crear objeto JSON con toda la información
        // Incluir combos y formatear fecha de compra a zona Perú
        const combos = (orden.ordenCombos || []).map(oc => ({ nombre: oc.combo?.nombre || 'N/A', cantidad: oc.cantidad }));
        const fechaCompraFormateada = orden.fecha_compra ? new Date(orden.fecha_compra).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : 'N/A';

        const qrData = {
            tipo: "CINESTAR_TICKET",
            orden_id: orden.id,
            pelicula: pelicula,
            funcion: {
                fecha: fecha,
                hora: hora
            },
            ubicacion: {
                sede: sede,
                sala: sala
            },
            asientos: asientos,
            combos: combos,
            pago: {
                total: parseFloat(total.toFixed(2)),
                estado: orden.pago?.estado_pago || 'pendiente',
                metodo: orden.pago?.metodoPago?.nombre || 'N/A'
            },
            fecha_compra: fechaCompraFormateada,
            cliente: orden.usuario?.nombre || 'N/A'
        };
        
        // Convertir a JSON con formato legible (indentación de 2 espacios)
        const jsonData = JSON.stringify(qrData, null, 2);
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonData)}`;
    };

        const printOrden = (orden) => {
                const urlQR = generarQR(orden);
                const html = `
                <html>
                    <head>
                        <title>Comprobante Orden ${orden.id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .header { text-align: center; }
                            .section { margin-top: 20px; }
                            .line { display:flex; justify-content:space-between; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>CineStar - Comprobante</h1>
                            <p>Orden #${orden.id}</p>
                        </div>
                        <div class="section">
                            <img src="${urlQR}" alt="QR Orden ${orden.id}" />
                        </div>
                        <div class="section">
                            <h3>Cliente</h3>
                            <p>${orden.usuario?.nombre || 'N/A'} - ${orden.usuario?.email || ''}</p>
                        </div>
                        <div class="section">
                            <h3>Detalles</h3>
                            <div class="line"><span>Fecha:</span><span>${new Date(orden.fecha_compra).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</span></div>
                            <div class="line"><span>Total:</span><span>S/ ${calcularTotal(orden).toFixed(2)}</span></div>
                        </div>
                    </body>
                </html>`;

                const w = window.open('', '_blank');
                if (!w) return alert('Pop-up bloqueado. Permite ventanas emergentes para imprimir.');
                w.document.open();
                w.document.write(html);
                w.document.close();
                w.focus();
                setTimeout(() => { w.print(); w.close(); }, 500);
        };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando compras...</div>;
    }

    // Si es admin, mostrar mensaje
    if (user?.rol === 'admin') {
        return (
            <div className="mis-compras">
                <div className="admin-message-container">
                    <div className="admin-message-card">
                        <div className="admin-icon">🎬</div>
                        <h2>Panel de Administración</h2>
                        <p className="admin-message-text">
                            Los administradores no pueden realizar compras personales.
                        </p>
                        <p className="admin-message-subtext">
                            Para gestionar las órdenes de todos los clientes, dirígete al Panel Admin.
                        </p>
                        <button 
                            className="btn-panel-admin" 
                            onClick={() => navigate('/admin')}
                        >
                            Ir al Panel Admin →
                        </button>
                    </div>
                </div>
            </div>
        );
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
                                                    src={generarQR(orden)} 
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
                                                onClick={() => printOrden(orden)}
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

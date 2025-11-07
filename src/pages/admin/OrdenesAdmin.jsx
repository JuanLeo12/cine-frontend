import React, { useState, useEffect } from 'react';
import { getOrdenesUsuario } from '../../services/api';
import './css/OrdenesAdmin.css';

function OrdenesAdmin() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [ordenExpandida, setOrdenExpandida] = useState(null);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            const data = await getOrdenesUsuario();
            // Ordenar por fecha más reciente primero
            const ordenesOrdenadas = data.sort((a, b) => 
                new Date(b.fecha_compra) - new Date(a.fecha_compra)
            );
            setOrdenes(ordenesOrdenadas);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    const ordenesFiltradas = ordenes.filter(orden => {
        if (filtroEstado === 'todas') return true;
        return orden.estado === filtroEstado;
    });

    const calcularTotal = (orden) => {
        if (orden.monto_total && orden.monto_total > 0) {
            return Number(orden.monto_total);
        }

        let total = 0;
        if (orden.ordenTickets) {
            orden.ordenTickets.forEach(ot => {
                total += Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1);
            });
        }
        if (orden.ordenCombos) {
            orden.ordenCombos.forEach(oc => {
                total += Number(oc.precio_unitario || 0) * Number(oc.cantidad || 0);
            });
        }
        return total;
    };

    const getEstadoBadgeClass = (estado) => {
        switch(estado) {
            case 'pagada': return 'badge-pagada';
            case 'pendiente': return 'badge-pendiente';
            case 'cancelada': return 'badge-cancelada';
            default: return '';
        }
    };

    if (loading) {
        return <div className="loading-container">Cargando órdenes...</div>;
    }

    return (
        <div className="ordenes-admin">
            <div className="ordenes-header">
                <h2>📦 Todas las Órdenes de Compra</h2>
                <div className="ordenes-stats">
                    <div className="stat-card">
                        <span className="stat-number">{ordenes.length}</span>
                        <span className="stat-label">Total Órdenes</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {ordenes.filter(o => o.estado === 'pagada').length}
                        </span>
                        <span className="stat-label">Pagadas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            S/ {ordenes.reduce((sum, o) => sum + calcularTotal(o), 0).toFixed(2)}
                        </span>
                        <span className="stat-label">Ingresos Totales</span>
                    </div>
                </div>
            </div>

            <div className="ordenes-filtros">
                <button 
                    className={filtroEstado === 'todas' ? 'filtro-btn active' : 'filtro-btn'}
                    onClick={() => setFiltroEstado('todas')}
                >
                    Todas ({ordenes.length})
                </button>
                <button 
                    className={filtroEstado === 'pagada' ? 'filtro-btn active' : 'filtro-btn'}
                    onClick={() => setFiltroEstado('pagada')}
                >
                    Pagadas ({ordenes.filter(o => o.estado === 'pagada').length})
                </button>
                <button 
                    className={filtroEstado === 'pendiente' ? 'filtro-btn active' : 'filtro-btn'}
                    onClick={() => setFiltroEstado('pendiente')}
                >
                    Pendientes ({ordenes.filter(o => o.estado === 'pendiente').length})
                </button>
            </div>

            <div className="ordenes-lista">
                {ordenesFiltradas.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 No hay órdenes con el filtro seleccionado</p>
                    </div>
                ) : (
                    ordenesFiltradas.map(orden => {
                        const total = calcularTotal(orden);
                        const isExpanded = ordenExpandida === orden.id;

                        return (
                            <div key={orden.id} className="orden-card">
                                <div 
                                    className="orden-header"
                                    onClick={() => setOrdenExpandida(isExpanded ? null : orden.id)}
                                >
                                    <div className="orden-info-principal">
                                        <h3>Orden #{orden.id}</h3>
                                        <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                                            {orden.estado}
                                        </span>
                                    </div>
                                    <div className="orden-info-secundaria">
                                        <div className="info-item">
                                            <span className="label">Cliente:</span>
                                            <span className="value">{orden.usuario?.nombre || 'N/A'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Fecha:</span>
                                            <span className="value">
                                                {new Date(orden.fecha_compra).toLocaleDateString('es-PE')}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Total:</span>
                                            <span className="value precio">S/ {total.toFixed(2)}</span>
                                        </div>
                                        <div className="expand-icon">
                                            {isExpanded ? '▲' : '▼'}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="orden-detalles">
                                        {/* Función */}
                                        {orden.funcion && (
                                            <div className="detalle-seccion">
                                                <h4>🎬 Función</h4>
                                                <p><strong>{orden.funcion.pelicula?.titulo}</strong></p>
                                                <p>{orden.funcion.sala?.sede?.nombre} - {orden.funcion.sala?.nombre}</p>
                                                <p>{orden.funcion.fecha} a las {orden.funcion.hora}</p>
                                            </div>
                                        )}

                                        {/* Tickets */}
                                        {orden.ordenTickets && orden.ordenTickets.length > 0 && (
                                            <div className="detalle-seccion">
                                                <h4>🎫 Tickets</h4>
                                                {orden.ordenTickets.map((ot, idx) => (
                                                    <div key={idx} className="detalle-item">
                                                        <span>{ot.cantidad}x {ot.tipoTicket?.nombre || 'Ticket'}</span>
                                                        <span>S/ {(ot.precio_unitario * ot.cantidad).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Combos */}
                                        {orden.ordenCombos && orden.ordenCombos.length > 0 && (
                                            <div className="detalle-seccion">
                                                <h4>🍿 Combos</h4>
                                                {orden.ordenCombos.map((oc, idx) => (
                                                    <div key={idx} className="detalle-item">
                                                        <span>{oc.cantidad}x {oc.combo?.nombre || 'Combo'}</span>
                                                        <span>S/ {(oc.precio_unitario * oc.cantidad).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pago */}
                                        {orden.pago && (
                                            <div className="detalle-seccion">
                                                <h4>💳 Información de Pago</h4>
                                                <div className="detalle-item">
                                                    <span>Método:</span>
                                                    <span>{orden.pago.metodoPago?.nombre || 'N/A'}</span>
                                                </div>
                                                <div className="detalle-item">
                                                    <span>Estado:</span>
                                                    <span className={`badge ${orden.pago.estado_pago === 'completado' ? 'badge-pagada' : 'badge-pendiente'}`}>
                                                        {orden.pago.estado_pago}
                                                    </span>
                                                </div>
                                                <div className="detalle-item">
                                                    <span>Fecha de Pago:</span>
                                                    <span>
                                                        {orden.pago.fecha_pago 
                                                            ? new Date(orden.pago.fecha_pago).toLocaleString('es-PE')
                                                            : 'N/A'
                                                        }
                                                    </span>
                                                </div>
                                                {orden.descuento > 0 && (
                                                    <div className="detalle-item">
                                                        <span>💰 Descuento Aplicado:</span>
                                                        <span className="descuento-text">- S/ {Number(orden.descuento).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default OrdenesAdmin;

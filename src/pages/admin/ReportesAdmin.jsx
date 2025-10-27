import React, { useState, useEffect } from 'react';
import { getOrdenesUsuario } from '../../services/api';
import './css/ReportesAdmin.css';

function ReportesAdmin() {
    const [periodo, setPeriodo] = useState('semana');
    const [reportes, setReportes] = useState({
        ventasTotal: 0,
        ticketsVendidos: 0,
        combosVendidos: 0,
        ingresosPorDia: [],
        peliculasPopulares: [],
        metodoPagoMasUsado: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo]);

    const cargarReportes = async () => {
        try {
            setLoading(true);
            
            // Calcular fechas según el período
            const fechaFin = new Date();
            const fechaInicio = new Date();
            
            if (periodo === 'semana') {
                fechaInicio.setDate(fechaInicio.getDate() - 7);
            } else if (periodo === 'mes') {
                fechaInicio.setMonth(fechaInicio.getMonth() - 1);
            } else if (periodo === 'año') {
                fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
            }

            // Obtener todas las órdenes (admin puede ver todas)
            const todasOrdenes = await getOrdenesUsuario();
            
            console.log('📊 Órdenes recibidas:', todasOrdenes);

            const ordenes = todasOrdenes.filter(orden => {
                const fechaOrden = new Date(orden.fecha_compra);
                return fechaOrden >= fechaInicio && fechaOrden <= fechaFin;
            });

            console.log('📊 Órdenes filtradas por período:', ordenes);

            // Calcular estadísticas
            let ventasTotal = 0;
            let ticketsVendidos = 0;
            let combosVendidos = 0;
            
            ordenes.forEach(orden => {
                // Sumar total del pago
                if (orden.pago && orden.pago.monto_total) {
                    ventasTotal += parseFloat(orden.pago.monto_total);
                }
                
                // Contar tickets
                if (orden.ordenTickets && Array.isArray(orden.ordenTickets)) {
                    orden.ordenTickets.forEach(ot => {
                        ticketsVendidos += parseInt(ot.cantidad) || 0;
                    });
                }
                
                // Contar combos
                if (orden.ordenCombos && Array.isArray(orden.ordenCombos)) {
                    orden.ordenCombos.forEach(oc => {
                        combosVendidos += parseInt(oc.cantidad) || 0;
                    });
                }
            });

            // Ventas por película
            const ventasPorPelicula = {};
            ordenes.forEach(orden => {
                if (orden.funcion && orden.funcion.pelicula) {
                    const titulo = orden.funcion.pelicula.titulo || 'Sin título';
                    const montoOrden = orden.pago ? parseFloat(orden.pago.monto_total) : 0;
                    
                    if (!ventasPorPelicula[titulo]) {
                        ventasPorPelicula[titulo] = 0;
                    }
                    ventasPorPelicula[titulo] += montoOrden;
                }
            });

            const peliculasPopulares = Object.entries(ventasPorPelicula)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([titulo, ventas]) => ({ titulo, ventas }));

            // Método de pago más usado
            const metodosPago = {};
            ordenes.forEach(orden => {
                if (orden.pago && orden.pago.metodoPago) {
                    const metodo = orden.pago.metodoPago.nombre || 'Sin definir';
                    metodosPago[metodo] = (metodosPago[metodo] || 0) + 1;
                }
            });

            const metodoPagoMasUsado = Object.entries(metodosPago)
                .sort((a, b) => b[1] - a[1])[0];

            console.log('📊 Estadísticas calculadas:', {
                ventasTotal,
                ticketsVendidos,
                combosVendidos,
                peliculasPopulares,
                metodoPagoMasUsado
            });

            setReportes({
                ventasTotal,
                ticketsVendidos,
                combosVendidos,
                peliculasPopulares,
                metodoPagoMasUsado: metodoPagoMasUsado ? {
                    nombre: metodoPagoMasUsado[0],
                    cantidad: metodoPagoMasUsado[1]
                } : null
            });

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            alert('Error al cargar reportes. Verifica la consola.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Cargando reportes...</div>;
    }

    return (
        <div className="reportes-admin">
            <div className="section-header">
                <h2>📊 Reportes de Ventas</h2>
                <select 
                    value={periodo} 
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="periodo-selector"
                >
                    <option value="semana">Última Semana</option>
                    <option value="mes">Último Mes</option>
                    <option value="año">Último Año</option>
                </select>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Ventas Totales</h3>
                        <p className="stat-value">S/ {reportes.ventasTotal.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎫</div>
                    <div className="stat-info">
                        <h3>Tickets Vendidos</h3>
                        <p className="stat-value">{reportes.ticketsVendidos}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🍿</div>
                    <div className="stat-info">
                        <h3>Combos Vendidos</h3>
                        <p className="stat-value">{reportes.combosVendidos}</p>
                    </div>
                </div>

                {reportes.metodoPagoMasUsado && (
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-info">
                            <h3>Método Más Usado</h3>
                            <p className="stat-value">{reportes.metodoPagoMasUsado.nombre}</p>
                            <p className="stat-detail">{reportes.metodoPagoMasUsado.cantidad} transacciones</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="chart-section">
                <h3>🎬 Películas Más Populares</h3>
                {reportes.peliculasPopulares.length > 0 ? (
                    <div className="movies-chart">
                        {reportes.peliculasPopulares.map((pelicula, index) => (
                            <div key={index} className="movie-bar">
                                <span className="movie-rank">{index + 1}</span>
                                <span className="movie-title">{pelicula.titulo}</span>
                                <div className="movie-bar-container">
                                    <div 
                                        className="movie-bar-fill" 
                                        style={{ 
                                            width: `${(pelicula.ventas / reportes.peliculasPopulares[0].ventas) * 100}%` 
                                        }}
                                    />
                                </div>
                                <span className="movie-revenue">S/ {pelicula.ventas.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No hay datos de películas en este período</p>
                )}
            </div>
        </div>
    );
}

export default ReportesAdmin;

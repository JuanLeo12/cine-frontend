import React, { useState, useEffect } from 'react';
import { getFunciones, getOrdenesUsuario, getSalas } from '../../services/api';
import PeliculasAdmin from './PeliculasAdmin';
import SedesAdmin from './SedesAdmin';
import FuncionesAdmin from './FuncionesAdmin';
import CombosAdmin from './CombosAdmin';
import UsuariosAdmin from './UsuariosAdmin';
import ReportesAdmin from './ReportesAdmin';
import OrdenesAdmin from './OrdenesAdmin';
import ServiciosCorporativosAdmin from './ServiciosCorporativosAdmin';
import './css/AdminPanel.css';

function AdminPanel() {
    const [seccionActiva, setSeccionActiva] = useState('reportes');
    const [estadisticas, setEstadisticas] = useState({
        funcionesHoy: 0,
        ventasDelDia: 0,
        ocupacionPromedio: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setLoadingStats(true);
            const [funciones, ordenes, salas] = await Promise.all([
                getFunciones(),
                getOrdenesUsuario(),
                getSalas()
            ]);

            // Funciones de hoy
            const hoy = new Date().toISOString().split('T')[0];
            const funcionesHoy = funciones.filter(f => f.fecha === hoy).length;

            // Ventas del día
            const ordenesHoy = ordenes.filter(o => {
                const fechaOrden = new Date(o.fecha_compra).toISOString().split('T')[0];
                return fechaOrden === hoy;
            });
            const ventasDelDia = ordenesHoy.reduce((sum, o) => {
                // `monto_total` puede venir como string (DECIMAL en la DB),
                // forzamos a número para evitar que la suma sea una concatenación de strings
                const monto = Number(o.pago?.monto_total || 0);
                return sum + (isNaN(monto) ? 0 : monto);
            }, 0);

            // Ocupación promedio de salas (asientos ocupados vs totales)
            let totalAsientos = 0;
            let asientosOcupados = 0;
            
            funciones.forEach(funcion => {
                const sala = salas.find(s => s.id === funcion.id_sala);
                if (sala && sala.filas && sala.columnas) {
                    const capacidad = sala.filas * sala.columnas;
                    totalAsientos += capacidad;
                    
                    // Contar asientos ocupados de órdenes para esta función
                    const ordenesFunc = ordenes.filter(o => o.id_funcion === funcion.id);
                    ordenesFunc.forEach(orden => {
                        if (orden.ordenTickets && Array.isArray(orden.ordenTickets)) {
                            orden.ordenTickets.forEach(ot => {
                                asientosOcupados += parseInt(ot.cantidad) || 0;
                            });
                        }
                    });
                }
            });

            const ocupacionPromedio = totalAsientos > 0
                ? Number(((asientosOcupados / totalAsientos) * 100).toFixed(1))
                : 0;

            setEstadisticas({
                funcionesHoy,
                ventasDelDia,
                ocupacionPromedio
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const renderSeccion = () => {
        switch (seccionActiva) {
            case 'reportes':
                return <ReportesAdmin />;
            case 'ordenes':
                return <OrdenesAdmin />;
            case 'servicios-corporativos':
                return <ServiciosCorporativosAdmin />;
            case 'peliculas':
                return <PeliculasAdmin />;
            case 'sedes':
                return <SedesAdmin />;
            case 'funciones':
                return <FuncionesAdmin />;
            case 'combos':
                return <CombosAdmin />;
            case 'usuarios':
                return <UsuariosAdmin />;
            default:
                return <ReportesAdmin />;
        }
    };

    return (
        <div className="admin-panel">
            <h1 className="admin-title">🎬 Panel de Administración</h1>
            
            {/* Widgets de estadísticas rápidas */}
            {!loadingStats && (
                <div className="quick-stats">
                    <div className="stat-widget">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <h3>Funciones Hoy</h3>
                            <p className="stat-number">{estadisticas.funcionesHoy}</p>
                        </div>
                    </div>
                    <div className="stat-widget">
                        <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>Ventas del Día</h3>
                                <p className="stat-number">S/ {Number(estadisticas.ventasDelDia || 0).toFixed(2)}</p>
                            </div>
                    </div>
                    <div className="stat-widget">
                        <div className="stat-icon">🎟️</div>
                        <div className="stat-content">
                            <h3>Ocupación Promedio</h3>
                            <p className="stat-number">{estadisticas.ocupacionPromedio}%</p>
                        </div>
                    </div>
                </div>
            )}
            
            <nav className="admin-nav">
                <button
                    className={seccionActiva === 'reportes' ? 'active' : ''}
                    onClick={() => setSeccionActiva('reportes')}
                >
                    📊 Reportes
                </button>
                <button
                    className={seccionActiva === 'ordenes' ? 'active' : ''}
                    onClick={() => setSeccionActiva('ordenes')}
                >
                    📦 Todas las Órdenes
                </button>
                <button
                    className={seccionActiva === 'servicios-corporativos' ? 'active' : ''}
                    onClick={() => setSeccionActiva('servicios-corporativos')}
                >
                    🏢 Servicios Corporativos
                </button>
                <button
                    className={seccionActiva === 'peliculas' ? 'active' : ''}
                    onClick={() => setSeccionActiva('peliculas')}
                >
                    🎥 Películas
                </button>
                <button
                    className={seccionActiva === 'sedes' ? 'active' : ''}
                    onClick={() => setSeccionActiva('sedes')}
                >
                    🏢 Sedes
                </button>
                <button
                    className={seccionActiva === 'funciones' ? 'active' : ''}
                    onClick={() => setSeccionActiva('funciones')}
                >
                    📅 Funciones
                </button>
                <button
                    className={seccionActiva === 'combos' ? 'active' : ''}
                    onClick={() => setSeccionActiva('combos')}
                >
                    🍿 Dulcería
                </button>
                <button
                    className={seccionActiva === 'usuarios' ? 'active' : ''}
                    onClick={() => setSeccionActiva('usuarios')}
                >
                    👥 Usuarios
                </button>
            </nav>

            <div className="admin-content">
                {renderSeccion()}
            </div>
        </div>
    );
}

export default AdminPanel;

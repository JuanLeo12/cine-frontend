import React, { useState, useEffect } from 'react';
import { getFunciones } from '../../services/api';

function FuncionesAdmin() {
    const [funciones, setFunciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaFiltro, setFechaFiltro] = useState('');

    useEffect(() => {
        cargarFunciones();
    }, []);

    const cargarFunciones = async () => {
        try {
            const data = await getFunciones();
            setFunciones(data);
        } catch (error) {
            console.error('Error al cargar funciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const funcionesFiltradas = fechaFiltro
        ? funciones.filter(f => f.fecha === fechaFiltro)
        : funciones;

    if (loading) {
        return <div className="loading-spinner">Cargando funciones...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Funciones</h2>
            </div>

            <div className="search-bar">
                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    placeholder="Filtrar por fecha..."
                />
            </div>

            {funcionesFiltradas.length === 0 ? (
                <div className="no-data">No hay funciones registradas</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Película</th>
                            <th>Sede</th>
                            <th>Sala</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionesFiltradas.map((funcion) => (
                            <tr key={funcion.id}>
                                <td>{funcion.Pelicula?.titulo || 'N/A'}</td>
                                <td>{funcion.Sala?.Sede?.nombre || 'N/A'}</td>
                                <td>{funcion.Sala?.nombre || 'N/A'}</td>
                                <td>{new Date(funcion.fecha).toLocaleDateString('es-PE')}</td>
                                <td>{funcion.hora.substring(0, 5)}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: funcion.estado === 'activa' ? '#4caf50' : '#9e9e9e',
                                        fontSize: '0.85rem'
                                    }}>
                                        {funcion.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FuncionesAdmin;

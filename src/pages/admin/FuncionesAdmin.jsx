import React, { useState, useEffect } from 'react';
import { getTodasFunciones, getPeliculas, getSedes, getSalas, createFuncion, desactivarFuncionesPasadas, desactivarFuncion } from '../../services/api';
import './css/FuncionesAdmin.css';

function FuncionesAdmin() {
    const [funciones, setFunciones] = useState([]);
    const [peliculas, setPeliculas] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaFiltro, setFechaFiltro] = useState('');
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [mostrarVerificar, setMostrarVerificar] = useState(false);
    
    // Formulario crear función
    const [nuevaFuncion, setNuevaFuncion] = useState({
        id_pelicula: '',
        id_sala: '',
        fecha: '',
        hora: ''
    });

    // Estado verificación
    const [analisis, setAnalisis] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [funcionesData, peliculasData, sedesData, salasData] = await Promise.all([
                getTodasFunciones(),
                getPeliculas(),
                getSedes(),
                getSalas()
            ]);
            
            setFunciones(funcionesData);
            setPeliculas(peliculasData);
            setSedes(sedesData);
            setSalas(salasData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const verificarCobertura = () => {
        const analisisResult = {
            peliculasSinFunciones: [],
            funcionesPorSede: {},
            recomendaciones: []
        };

        // Analizar cada película
        peliculas.forEach(pelicula => {
            const funcionesPelicula = funciones.filter(f => f.pelicula?.id === pelicula.id);
            
            if (funcionesPelicula.length === 0) {
                analisisResult.peliculasSinFunciones.push(pelicula);
            } else {
                // Verificar cobertura por sede
                const sedesConFunciones = new Set(
                    funcionesPelicula.map(f => f.sala?.sede?.id).filter(Boolean)
                );
                
                const sedesSinCobertura = sedes.filter(sede => !sedesConFunciones.has(sede.id));
                
                if (sedesSinCobertura.length > 0) {
                    analisisResult.recomendaciones.push({
                        pelicula: pelicula.titulo,
                        sedesFaltantes: sedesSinCobertura.map(s => s.nombre),
                        peliculaId: pelicula.id
                    });
                }
            }
        });

        // Analizar funciones por sede
        sedes.forEach(sede => {
            const funcionesSede = funciones.filter(f => f.sala?.sede?.id === sede.id);
            const peliculasEnSede = new Set(funcionesSede.map(f => f.pelicula?.id).filter(Boolean));
            
            analisisResult.funcionesPorSede[sede.nombre] = {
                totalFunciones: funcionesSede.length,
                peliculasUnicas: peliculasEnSede.size,
                sedeId: sede.id
            };
        });

        setAnalisis(analisisResult);
        setMostrarVerificar(true);
    };

    const handleCrearFuncion = async (e) => {
        e.preventDefault();
        
        if (!nuevaFuncion.id_pelicula || !nuevaFuncion.id_sala || !nuevaFuncion.fecha || !nuevaFuncion.hora) {
            alert('Completa todos los campos');
            return;
        }

        try {
            await createFuncion(nuevaFuncion);
            alert('✅ Función creada exitosamente');
            setNuevaFuncion({ id_pelicula: '', id_sala: '', fecha: '', hora: '' });
            setMostrarCrear(false);
            cargarDatos();
        } catch (error) {
            console.error('Error creando función:', error);
            alert('Error al crear función: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDesactivarPasadas = async () => {
        if (!window.confirm('¿Desactivar todas las funciones pasadas? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const resultado = await desactivarFuncionesPasadas();
            alert(resultado.message);
            cargarDatos();
        } catch (error) {
            console.error('Error desactivando funciones:', error);
            alert('Error al desactivar funciones: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDesactivarFuncion = async (id) => {
        if (!window.confirm('¿Desactivar esta función? Los usuarios ya no podrán comprar tickets para ella.')) {
            return;
        }

        try {
            await desactivarFuncion(id);
            alert('✅ Función desactivada exitosamente');
            cargarDatos();
        } catch (error) {
            console.error('Error desactivando función:', error);
            alert('Error al desactivar función: ' + (error.response?.data?.error || error.message));
        }
    };

    const funcionesFiltradas = fechaFiltro
        ? funciones.filter(f => f.fecha === fechaFiltro)
        : funciones;

    if (loading) {
        return <div className="loading-spinner">Cargando funciones...</div>;
    }

    return (
        <div className="funciones-admin">
            <div className="section-header">
                <h2>📽️ Gestión de Funciones</h2>
                <div className="action-buttons">
                    <button onClick={() => setMostrarCrear(!mostrarCrear)} className="btn-primary">
                        {mostrarCrear ? 'Cancelar' : '➕ Nueva Función'}
                    </button>
                    <button onClick={handleDesactivarPasadas} className="btn-warning">
                        🗑️ Desactivar Pasadas
                    </button>
                    <button onClick={verificarCobertura} className="btn-secondary">
                        🔍 Verificar Cobertura
                    </button>
                </div>
            </div>

            {/* Formulario Crear Función */}
            {mostrarCrear && (
                <div className="crear-funcion-form">
                    <h3>Crear Nueva Función</h3>
                    <form onSubmit={handleCrearFuncion}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Película:</label>
                                <select
                                    value={nuevaFuncion.id_pelicula}
                                    onChange={(e) => setNuevaFuncion({...nuevaFuncion, id_pelicula: e.target.value})}
                                    required
                                >
                                    <option value="">Selecciona una película</option>
                                    {peliculas.sort((a, b) => a.titulo.localeCompare(b.titulo)).map(pelicula => (
                                        <option key={pelicula.id} value={pelicula.id}>
                                            {pelicula.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Sala:</label>
                                <select
                                    value={nuevaFuncion.id_sala}
                                    onChange={(e) => setNuevaFuncion({...nuevaFuncion, id_sala: e.target.value})}
                                    required
                                >
                                    <option value="">Selecciona una sala</option>
                                    {salas.map(sala => (
                                        <option key={sala.id} value={sala.id}>
                                            {sala.nombre} - {sala.sede?.nombre || 'Sin sede'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha:</label>
                                <input
                                    type="date"
                                    value={nuevaFuncion.fecha}
                                    onChange={(e) => setNuevaFuncion({...nuevaFuncion, fecha: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora:</label>
                                <input
                                    type="time"
                                    value={nuevaFuncion.hora}
                                    onChange={(e) => setNuevaFuncion({...nuevaFuncion, hora: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">Crear Función</button>
                    </form>
                </div>
            )}

            {/* Análisis de Cobertura */}
            {mostrarVerificar && analisis && (
                <div className="analisis-cobertura">
                    <div className="analisis-header">
                        <h3>📊 Análisis de Cobertura</h3>
                        <button onClick={() => setMostrarVerificar(false)} className="btn-close">✖</button>
                    </div>

                    {/* Películas sin funciones */}
                    {analisis.peliculasSinFunciones.length > 0 && (
                        <div className="analisis-section alert">
                            <h4>⚠️ Películas sin funciones ({analisis.peliculasSinFunciones.length})</h4>
                            <ul>
                                {analisis.peliculasSinFunciones.map(pelicula => (
                                    <li key={pelicula.id}>{pelicula.titulo}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {analisis.recomendaciones.length > 0 && (
                        <div className="analisis-section warning">
                            <h4>💡 Cobertura Incompleta ({analisis.recomendaciones.length} películas)</h4>
                            {analisis.recomendaciones.map((rec, index) => (
                                <div key={index} className="recomendacion">
                                    <strong>{rec.pelicula}</strong> no tiene funciones en:
                                    <span className="sedes-faltantes">
                                        {rec.sedesFaltantes.join(', ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Funciones por sede */}
                    <div className="analisis-section">
                        <h4>🏢 Funciones por Sede</h4>
                        <div className="sedes-grid">
                            {Object.entries(analisis.funcionesPorSede).map(([sede, datos]) => (
                                <div key={sede} className="sede-card">
                                    <h5>{sede}</h5>
                                    <p>{datos.totalFunciones} funciones</p>
                                    <p>{datos.peliculasUnicas} películas únicas</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {analisis.peliculasSinFunciones.length === 0 && analisis.recomendaciones.length === 0 && (
                        <div className="analisis-section success">
                            <h4>✅ Cobertura Completa</h4>
                            <p>Todas las películas tienen funciones en todas las sedes.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Filtros */}
            <div className="search-bar">
                <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    placeholder="Filtrar por fecha..."
                />
                {fechaFiltro && (
                    <button onClick={() => setFechaFiltro('')} className="btn-clear">
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Tabla de Funciones */}
            {funcionesFiltradas.length === 0 ? (
                <div className="no-data">No hay funciones registradas</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Película</th>
                            <th>Sede</th>
                            <th>Sala</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionesFiltradas.map((funcion) => (
                            <tr key={funcion.id}>
                                <td>{funcion.id}</td>
                                <td>{funcion.pelicula?.titulo || 'N/A'}</td>
                                <td>{funcion.sala?.sede?.nombre || 'N/A'}</td>
                                <td>{funcion.sala?.nombre || 'N/A'}</td>
                                <td>{new Date(funcion.fecha).toLocaleDateString('es-PE')}</td>
                                <td>{funcion.hora.substring(0, 5)}</td>
                                <td>
                                    <span className={`badge badge-${funcion.estado}`}>
                                        {funcion.estado}
                                    </span>
                                </td>
                                <td>
                                    {funcion.estado === 'activa' && (
                                        <button
                                            onClick={() => handleDesactivarFuncion(funcion.id)}
                                            className="btn-danger-small"
                                            title="Desactivar función"
                                        >
                                            🚫 Desactivar
                                        </button>
                                    )}
                                    {funcion.estado === 'inactiva' && (
                                        <span className="text-muted">Inactiva</span>
                                    )}
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

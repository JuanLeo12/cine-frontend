import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPeliculaById, getFuncionesByPelicula } from '../../services/api';
import './css/MovieDetails.css';

function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [pelicula, setPelicula] = useState(null);
    const [funciones, setFunciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [fechasDisponibles, setFechasDisponibles] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const peliculaData = await getPeliculaById(id);
                setPelicula(peliculaData);

                // Solo cargar funciones si es película en cartelera
                if (peliculaData.tipo === 'cartelera') {
                    const funcionesData = await getFuncionesByPelicula(id);
                    setFunciones(funcionesData);

                    // Extraer fechas únicas
                    const fechas = [...new Set(funcionesData.map(f => f.fecha))].sort();
                    setFechasDisponibles(fechas);
                    if (fechas.length > 0) {
                        setFechaSeleccionada(fechas[0]);
                    }
                }
            } catch (error) {
                console.error('Error al cargar película:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleFuncionClick = (funcion) => {
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para comprar entradas.');
            return;
        }
        navigate('/seat-selection', { state: { funcion, pelicula } });
    };

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando película...</p>;
    }

    if (!pelicula) {
        return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Película no encontrada</h2>;
    }

    // Si es próximo estreno
    if (pelicula.tipo !== 'cartelera') {
        return (
            <div className="movie-details">
                <div className="movie-header">
                    <img src={pelicula.imagen_url} alt={pelicula.titulo} />
                    <div className="movie-info-container">
                        <h1>{pelicula.titulo}</h1>
                        <div className="movie-details-list">
                            <p><strong>Duración:</strong> {pelicula.duracion} min</p>
                            <p><strong>Género:</strong> {pelicula.genero}</p>
                            <p><strong>Clasificación:</strong> {pelicula.clasificacion}</p>
                            <p><strong>Fecha de estreno:</strong> {new Date(pelicula.fecha_estreno).toLocaleDateString('es-PE')}</p>
                            <p><strong>Sinopsis:</strong></p>
                            <p>{pelicula.sinopsis}</p>
                        </div>
                    </div>
                </div>

                <div className="showtimes">
                    <h2>Horarios Disponibles</h2>
                    <div className="proximo-estreno">
                        <p>🎬 ¡Próximamente en cartelera!</p>
                        <p>Estreno: {new Date(pelicula.fecha_estreno).toLocaleDateString('es-PE', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        })}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Agrupar funciones por sede
    const funcionesPorSede = funciones
        .filter(f => f.fecha === fechaSeleccionada)
        .reduce((acc, funcion) => {
            const sedeId = funcion.sala?.sede?.id;
            if (!sedeId) return acc;
            
            if (!acc[sedeId]) {
                acc[sedeId] = {
                    sede: funcion.sala.sede,
                    funciones: []
                };
            }
            acc[sedeId].funciones.push(funcion);
            return acc;
        }, {});

    // Verificar si una función ya pasó
    const isFuncionPasada = (funcion) => {
        const ahora = new Date();
        const fechaHoraFuncion = new Date(`${funcion.fecha}T${funcion.hora}`);
        return fechaHoraFuncion < ahora;
    };

    return (
        <div className="movie-details">
            <div className="movie-header">
                <img src={pelicula.imagen_url} alt={pelicula.titulo} />
                <div className="movie-info-container">
                    <h1>{pelicula.titulo}</h1>
                    <div className="movie-details-list">
                        <p><strong>Duración:</strong> {pelicula.duracion} min</p>
                        <p><strong>Género:</strong> {pelicula.genero}</p>
                        <p><strong>Clasificación:</strong> {pelicula.clasificacion}</p>
                        <p><strong>Sinopsis:</strong></p>
                        <p>{pelicula.sinopsis}</p>
                    </div>
                </div>
            </div>

            <div className="showtimes">
                <h2>Horarios Disponibles</h2>
                
                {fechasDisponibles.length > 0 ? (
                    <>
                        <div className="day-selector">
                            {fechasDisponibles.map((fecha) => (
                                <button
                                    key={fecha}
                                    className={fechaSeleccionada === fecha ? 'active' : ''}
                                    onClick={() => setFechaSeleccionada(fecha)}
                                >
                                    {new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short' 
                                    })}
                                </button>
                            ))}
                        </div>

                        <div className="theaters">
                            {Object.values(funcionesPorSede).map((item) => (
                                <div key={item.sede.id} className="theater">
                                    <h3>{item.sede.nombre}</h3>
                                    <p>{item.sede.direccion}</p>
                                    <div className="times">
                                        {item.funciones
                                            .sort((a, b) => a.hora.localeCompare(b.hora))
                                            .map((funcion) => {
                                                const pasada = isFuncionPasada(funcion);
                                                return (
                                                    <button
                                                        key={funcion.id}
                                                        className={`time-btn ${pasada ? 'disabled' : ''}`}
                                                        onClick={() => !pasada && handleFuncionClick(funcion)}
                                                        disabled={pasada}
                                                        title={pasada ? 'Función ya iniciada' : ''}
                                                    >
                                                        {funcion.hora.substring(0, 5)}
                                                        <span className="sala-info">{funcion.sala.nombre}</span>
                                                        {pasada && <span className="badge-pasada">Pasada</span>}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="proximo-estreno">
                        <p>No hay funciones disponibles en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MovieDetails;
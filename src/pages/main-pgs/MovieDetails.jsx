// src/pages/MovieDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { peliculas, sedes } from '../../data/mockData';
import './css/MovieDetails.css';


function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const pelicula = peliculas.find(p => p.id === id);

    const [diaSeleccionado, setDiaSeleccionado] = useState('hoy');

    if (!pelicula) {
        return <h2>Película no encontrada</h2>;
    }

    // Simulación de horarios diferentes por día (opcional, si quieres mantenerlo dinámico)
    const horariosPorDia = {
        hoy: {
            "CineStar Plaza Norte": ["15:30", "18:00", "20:45"],
            "CineStar San Borja": ["14:00", "16:30", "19:00"],
            "CineStar Miraflores": ["17:00", "19:30"]
        },
        mañana: {
            "CineStar Plaza Norte": ["16:00", "19:00"],
            "CineStar San Borja": ["15:30", "18:30"],
            "CineStar Miraflores": ["14:00", "16:30", "19:00"]
        }
    };

    const handleHorarioClick = (sedeNombre, horario) => {
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para comprar entradas.');
            // Aquí puedes redirigir al login o abrir un modal
            return;
        }

        // Aquí puedes pasar sede y horario como estado o parámetros
        // Por simplicidad, pasamos solo la película y luego se puede pasar sede/horario como estado
        navigate(`/seat-selection/${id}`, { state: { sede: sedeNombre, horario } });
    };

    // Si la película no está disponible, no mostramos horarios
    if (!pelicula.disponible) {
        return (
            <div className="movie-details">
                <div className="movie-header">
                    <img src={pelicula.imagen} alt={pelicula.titulo} />
                    <div className="movie-info-container">
                        <h1>{pelicula.titulo}</h1>
                        <div className="movie-details-list">
                            <p><strong>Duración:</strong> {pelicula.duracion}</p>
                            <p><strong>Género:</strong> {pelicula.genero}</p>
                            <p><strong>Clasificación:</strong> {pelicula.clasificacion || 'No disponible'}</p>
                            <p><strong>Formato:</strong> {pelicula.formato || '2D'}</p>
                            <p><strong>Idioma:</strong> {pelicula.idioma || 'Español Latino'}</p>
                            <p>{pelicula.sinopsis}</p>
                        </div>
                    </div>
                </div>

                <div className="showtimes">
                    <h2>Horarios Disponibles</h2>
                    <div className="proximo-estreno">
                        <p>¡Próximamente en cartelera!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Si está disponible, mostramos horarios
    const horariosSede = pelicula.sedes.map(nombreSede => {
        const sede = sedes.find(s => s.nombre === nombreSede);
        return {
            ...sede,
            horarios: horariosPorDia[diaSeleccionado][nombreSede] || []
        };
    });

    return (
        <div className="movie-details">
            <div className="movie-header">
                <img src={pelicula.imagen} alt={pelicula.titulo} />
                <div className="movie-info-container">
                    <h1>{pelicula.titulo}</h1>
                    <div className="movie-details-list">
                        <p><strong>Duración:</strong> {pelicula.duracion}</p>
                        <p><strong>Género:</strong> {pelicula.genero}</p>
                        <p><strong>Clasificación:</strong> {pelicula.clasificacion || 'No disponible'}</p>
                        <p><strong>Formato:</strong> {pelicula.formato || '2D'}</p>
                        <p><strong>Idioma:</strong> {pelicula.idioma || 'Español Latino'}</p>
                        <p>{pelicula.sinopsis}</p>
                    </div>
                </div>
            </div>

            <div className="showtimes">
                <h2>Horarios Disponibles</h2>
                <div className="day-selector">
                    <button
                        className={diaSeleccionado === 'hoy' ? 'active' : ''}
                        onClick={() => setDiaSeleccionado('hoy')}
                    >
                        Hoy
                    </button>
                    <button
                        className={diaSeleccionado === 'mañana' ? 'active' : ''}
                        onClick={() => setDiaSeleccionado('mañana')}
                    >
                        Mañana
                    </button>
                </div>

                <div className="theaters">
                    {horariosSede.map((sede) => (
                        <div key={sede.id} className="theater">
                            <h3>{sede.nombre}</h3>
                            <p>{sede.direccion}</p>
                            <div className="times">
                                {sede.horarios.length > 0 ? (
                                    sede.horarios.map((hora, index) => (
                                        <button
                                            key={index}
                                            className="time-btn"
                                            onClick={() => handleHorarioClick(sede.nombre, hora)}
                                        >
                                            {hora}
                                        </button>
                                    ))
                                ) : (
                                    <p>No hay funciones disponibles.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;
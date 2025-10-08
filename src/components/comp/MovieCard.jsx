import React from 'react';
import { Link } from 'react-router-dom';
import './css/MovieCard.css';

function MovieCard({ pelicula }) {
    return (
        <div className="movie-card">
            <img src={pelicula.imagen} alt={pelicula.titulo} />
            <div className="movie-info">
                <h3>{pelicula.titulo}</h3>
                <p>{pelicula.genero}</p>
                <p>{pelicula.duracion}</p>
                <Link to={`/movie/${pelicula.id}`}>Ver Detalles</Link>
            </div>
        </div>
    );
}

export default MovieCard;
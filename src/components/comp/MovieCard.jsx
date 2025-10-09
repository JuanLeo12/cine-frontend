import React from "react";
import { Link } from "react-router-dom";
import "./css/MovieCard.css";

function MovieCard({ pelicula }) {
  return (
    <div className="movie-card">
      <img
        src={
          pelicula.imagen_url ||
          "https://via.placeholder.com/300x450?text=Sin+imagen"
        }
        alt={pelicula.titulo}
        className="movie-poster"
      />
      <div className="movie-info">
        <h3>{pelicula.titulo}</h3>
        <p>{pelicula.genero}</p>
        <p>{pelicula.duracion ? `${pelicula.duracion} min` : ""}</p>
        <Link to={`/movie/${pelicula.id}`}>Ver Detalles</Link>
      </div>
    </div>
  );
}

export default MovieCard;

import React from 'react';
import Carousel from '../../components/comp/Carousel';
import MovieCard from '../../components/comp/MovieCard';
import { peliculasEnCartelera, proximosEstrenos } from '../../data/mockData';
import './css/Home.css';

function Home() {
    return (
        <div className="home">
            <Carousel peliculas={peliculasEnCartelera.slice(0, 3)} />
            <section className="section">
                <h2>En Cartelera</h2>
                <div className="movie-grid">
                    {peliculasEnCartelera.map((p) => (
                        <MovieCard key={p.id} pelicula={p} />
                    ))}
                </div>
            </section>
            <section className="section">
                <h2>Próximos Estrenos</h2>
                <div className="movie-grid">
                    {proximosEstrenos.map((p) => (
                        <MovieCard key={p.id} pelicula={p} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
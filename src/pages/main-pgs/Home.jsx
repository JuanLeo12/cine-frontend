import React, { useEffect, useState } from "react";
import Carousel from "../../components/comp/Carousel";
import MovieCard from "../../components/comp/MovieCard";
import { getPeliculasPorTipo } from "../../services/api";
import "./css/Home.css";

function Home() {
  const [peliculasCartelera, setPeliculasCartelera] = useState([]);
  const [peliculasEstrenos, setPeliculasEstrenos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeliculas = async () => {
      try {
        // ✅ Cargar ambas categorías en paralelo para más velocidad
        const [cartelera, estrenos] = await Promise.all([
          getPeliculasPorTipo("cartelera"),
          getPeliculasPorTipo("proxEstreno"),
        ]);

        setPeliculasCartelera(cartelera || []);
        setPeliculasEstrenos(estrenos || []);
      } catch (error) {
        console.error("Error al cargar las películas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeliculas();
  }, []);

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando películas...
      </p>
    );
  }

  return (
    <div className="home">
      {/* 🎞️ Carrusel con las primeras películas en cartelera */}
      {peliculasCartelera.length > 0 && (
        <Carousel peliculas={peliculasCartelera.slice(0, 3)} />
      )}

      {/* 🎬 En Cartelera */}
      <section className="section">
        <h2>En Cartelera</h2>
        <div className="movie-grid">
          {peliculasCartelera.length > 0 ? (
            peliculasCartelera.map((p) => <MovieCard key={p.id} pelicula={p} />)
          ) : (
            <p>No hay películas en cartelera.</p>
          )}
        </div>
      </section>

      {/* 🎥 Próximos Estrenos */}
      <section className="section">
        <h2>Próximos Estrenos</h2>
        <div className="movie-grid">
          {peliculasEstrenos.length > 0 ? (
            peliculasEstrenos.map((p) => <MovieCard key={p.id} pelicula={p} />)
          ) : (
            <p>No hay próximos estrenos.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

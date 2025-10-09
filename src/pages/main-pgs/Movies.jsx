import React, { useEffect, useState } from "react";
import MovieCard from "../../components/comp/MovieCard";
import { filtrarPeliculas } from "../../services/api";
import "./css/Movies.css";

function Movies() {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [tipo, setTipo] = useState("cartelera");
  const [genero, setGenero] = useState("Todos");
  const [clasificacion, setClasificacion] = useState("Todos");

  // 🔹 Cargar películas según los filtros
  useEffect(() => {
    const cargarPeliculas = async () => {
      setLoading(true);
      try {
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (genero !== "Todos") filtros.genero = genero;
        if (clasificacion !== "Todos") filtros.clasificacion = clasificacion;

        const data = await filtrarPeliculas(filtros);
        setPeliculas(data);
      } catch (error) {
        console.error("Error al cargar películas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPeliculas();
  }, [tipo, genero, clasificacion]);

  // 🔹 Extraer opciones únicas
  const generos = ["Todos", ...new Set(peliculas.map((p) => p.genero || ""))];
  const clasificaciones = [
    "Todos",
    ...new Set(peliculas.map((p) => p.clasificacion || "")),
  ];

  return (
    <div className="movies">
      {/* 🔹 Panel de filtros */}
      <aside className="filters">
        <h3>Filtros</h3>

        {/* Tipo */}
        <div className="filter-group">
          <label>Tipo:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipo"
                value="cartelera"
                checked={tipo === "cartelera"}
                onChange={() => setTipo("cartelera")}
              />{" "}
              En Cartelera
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                value="proxEstreno"
                checked={tipo === "proxEstreno"}
                onChange={() => setTipo("proxEstreno")}
              />{" "}
              Próximos Estrenos
            </label>
          </div>
        </div>

        {/* Género */}
        <div className="filter-group">
          <label>Género:</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)}>
            {generos.map((g) => (
              <option key={g} value={g}>
                {g || "Sin género"}
              </option>
            ))}
          </select>
        </div>

        {/* Clasificación */}
        <div className="filter-group">
          <label>Clasificación:</label>
          <select
            value={clasificacion}
            onChange={(e) => setClasificacion(e.target.value)}
          >
            {clasificaciones.map((c) => (
              <option key={c} value={c}>
                {c || "Sin clasificación"}
              </option>
            ))}
          </select>
        </div>
      </aside>

      {/* 🔹 Sección principal de películas */}
      <main style={{ flex: 1, minWidth: "0" }}>
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            Cargando películas...
          </p>
        ) : (
          <div className="movie-grid">
            {peliculas.length > 0 ? (
              peliculas.map((p) => <MovieCard key={p.id} pelicula={p} />)
            ) : (
              <p style={{ textAlign: "center", width: "100%" }}>
                No hay películas disponibles con los filtros seleccionados.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Movies;

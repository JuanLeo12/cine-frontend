import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import MovieCard from "../../components/comp/MovieCard";
import { filtrarPeliculas, getSedes, getFunciones, getPeliculas } from "../../services/api";
import "./css/Movies.css";

function Movies() {
  const [peliculas, setPeliculas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [tipo, setTipo] = useState("cartelera");
  const [genero, setGenero] = useState("Todos");
  const [clasificacion, setClasificacion] = useState("Todos");
  const [sedeId, setSedeId] = useState("Todas");
  const [fecha, setFecha] = useState("");

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [sedesData, funcionesData] = await Promise.all([
          getSedes(),
          getFunciones()
        ]);
        setSedes(sedesData);
        setFunciones(funcionesData);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    };
    cargarDatosIniciales();
  }, []);

  // 🔹 Cargar catálogo de películas (solo para extraer géneros y clasificaciones disponibles)
  const [peliculasCatalogo, setPeliculasCatalogo] = useState([]);
  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const all = await getPeliculas();
        setPeliculasCatalogo(all || []);
      } catch (error) {
        console.error("Error cargando catálogo de películas:", error);
      }
    };
    cargarCatalogo();
  }, []);

  // 🔹 Cargar películas según los filtros
  useEffect(() => {
    const cargarPeliculas = async () => {
      setLoading(true);
      try {
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (genero !== "Todos") filtros.genero = genero;
        if (clasificacion !== "Todos") filtros.clasificacion = clasificacion;

        let data = await filtrarPeliculas(filtros);

        // Filtrar por sede y/o fecha si se seleccionaron
        if (sedeId !== "Todas" || fecha) {
          const funcionesFiltradas = funciones.filter(f => {
            let cumple = true;
            if (sedeId !== "Todas" && f.sala?.sede?.id !== parseInt(sedeId)) {
              cumple = false;
            }
            if (fecha && f.fecha !== fecha) {
              cumple = false;
            }
            return cumple;
          });

          const peliculasConFunciones = new Set(funcionesFiltradas.map(f => f.pelicula?.id).filter(Boolean));
          data = data.filter(p => peliculasConFunciones.has(p.id));
        }

        setPeliculas(data);
      } catch (error) {
        console.error("Error al cargar películas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPeliculas();
  }, [tipo, genero, clasificacion, sedeId, fecha, funciones]);

  // 🔹 Extraer opciones únicas a partir del catálogo completo para evitar que
  // cambiar la selección reduzca las opciones disponibles
  const generos = ["Todos", ...new Set(peliculasCatalogo.map((p) => p.genero || ""))];
  const clasificaciones = [
    "Todos",
    ...new Set(peliculasCatalogo.map((p) => p.clasificacion || "")),
  ];

  // Fechas disponibles (próximos 7 días)
  const fechasDisponibles = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    fechasDisponibles.push(date.toISOString().split('T')[0]);
  }

  return (
    <div className="movies">
      {/* 🔹 Panel de filtros con Bootstrap */}
      <aside className="filters">
        <h3>Filtros</h3>

        <div className="filters-grid">
          {/* Tipo */}
          <div className="filter-item">
            <Form.Label className="filter-label">TIPO:</Form.Label>
            <div className="d-flex flex-column gap-2 mt-2">
              <Form.Check
                type="radio"
                id="tipo-cartelera"
                name="tipo"
                label="En Cartelera"
                value="cartelera"
                checked={tipo === "cartelera"}
                onChange={() => setTipo("cartelera")}
                className="filter-radio"
              />
              <Form.Check
                type="radio"
                id="tipo-proximo"
                name="tipo"
                label="Próximos Estrenos"
                value="proxEstreno"
                checked={tipo === "proxEstreno"}
                onChange={() => setTipo("proxEstreno")}
                className="filter-radio"
              />
            </div>
          </div>

          {/* Género */}
          <div className="filter-item">
            <Form.Label className="filter-label">GÉNERO:</Form.Label>
            <Form.Select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="filter-select mt-2"
            >
              {generos.map((g) => (
                <option key={g} value={g}>
                  {g || "Sin género"}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Clasificación */}
          <div className="filter-item">
            <Form.Label className="filter-label">CLASIFICACIÓN:</Form.Label>
            <Form.Select
              value={clasificacion}
              onChange={(e) => setClasificacion(e.target.value)}
              className="filter-select mt-2"
            >
              {clasificaciones.map((c) => (
                <option key={c} value={c}>
                  {c || "Sin clasificación"}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Sede */}
          {tipo === "cartelera" && (
            <div className="filter-item">
              <Form.Label className="filter-label">SEDE:</Form.Label>
              <Form.Select
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="filter-select mt-2"
              >
                <option value="Todas">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </Form.Select>
            </div>
          )}

          {/* Fecha */}
          {tipo === "cartelera" && (
            <div className="filter-item">
              <Form.Label className="filter-label">FECHA:</Form.Label>
              <Form.Select
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="filter-select mt-2"
              >
                <option value="">Todas las fechas</option>
                {fechasDisponibles.map((f) => (
                  <option key={f} value={f}>
                    {new Date(f + 'T00:00:00').toLocaleDateString('es-PE', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </option>
                ))}
              </Form.Select>
            </div>
          )}

          {/* Botón limpiar */}
          <div className="filter-item filter-item-button">
            <Button
              variant="outline-danger"
              className="btn-clear-filters"
              onClick={() => {
                setGenero("Todos");
                setClasificacion("Todos");
                setSedeId("Todas");
                setFecha("");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </aside>

      {/* 🔹 Sección principal de películas */}
      <main style={{ width: "100%" }}>
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            Cargando películas...
          </p>
        ) : (
          <div className="row g-4">
            {peliculas.length > 0 ? (
              peliculas.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <MovieCard pelicula={p} />
                </div>
              ))
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

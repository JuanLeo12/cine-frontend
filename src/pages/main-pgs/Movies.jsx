//import React, { useState } from 'react';
//import { peliculasEnCartelera, proximosEstrenos } from '../../data/mockData';

import React, { useEffect, useState } from 'react';
import MovieCard from '../../components/comp/MovieCard';
import { getPeliculas } from '../../services/api';
import './css/Movies.css';

function Movies() {
    const [peliculas, setPeliculas] = useState([]);
    const [filtro, setFiltro] = useState('cartelera');
    const [ciudad, setCiudad] = useState('Todas');
    const [cine, setCine] = useState('Todos');
    const [dia, setDia] = useState('Hoy');
    const [genero, setGenero] = useState('Todos');
    const [idioma, setIdioma] = useState('Todos');
    const [formato, setFormato] = useState('Todos');
    const [clasificacion, setClasificacion] = useState('Todos');

    // 🔹 Cargar películas desde el backend
    useEffect(() => {
        const cargarPeliculas = async () => {
            const data = await getPeliculas();
            setPeliculas(data);
        };
        cargarPeliculas();
    }, []);

    // 🔹 Extraer opciones únicas (solo si hay datos)
    const generos = ['Todos', ...new Set(peliculas.map(p => p.genero || ''))];
    const clasificaciones = ['Todos', ...new Set(peliculas.map(p => p.clasificacion || ''))];

    // 🔹 Aplicar filtros básicos
    let peliculasFiltradas = [...peliculas];

    if (genero !== 'Todos') {
        peliculasFiltradas = peliculasFiltradas.filter(p => p.genero?.includes(genero));
    }
    if (clasificacion !== 'Todos') {
        peliculasFiltradas = peliculasFiltradas.filter(p => p.clasificacion === clasificacion);
    }

    return (
        <div className="movies">
            <aside className="filters">
                <h3>Filtros</h3>
                <div className="filter-group">
                    <label>Estado:</label>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="filtro"
                                value="cartelera"
                                checked={filtro === 'cartelera'}
                                onChange={() => setFiltro('cartelera')}
                            /> En Cartelera
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="filtro"
                                value="estrenos"
                                checked={filtro === 'estrenos'}
                                onChange={() => setFiltro('estrenos')}
                            /> Próximos Estrenos
                        </label>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Género:</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                        {generos.map(g => <option key={g} value={g}>{g || 'Sin género'}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Clasificación:</label>
                    <select value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}>
                        {clasificaciones.map(c => <option key={c} value={c}>{c || 'Sin clasificación'}</option>)}
                    </select>
                </div>
            </aside>

            <main style={{ flex: 1, minWidth: '0' }}>
                <div className="movie-grid">
                    {peliculasFiltradas.length > 0 ? (
                        peliculasFiltradas.map((p) => (
                            <MovieCard key={p.id} pelicula={p} />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', width: '100%' }}>No hay películas disponibles.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Movies;
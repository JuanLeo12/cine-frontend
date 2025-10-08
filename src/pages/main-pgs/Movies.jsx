import React, { useState } from 'react';
import MovieCard from '../../components/comp/MovieCard';
import { peliculasEnCartelera, proximosEstrenos } from '../../data/mockData';
import './css/Movies.css';

function Movies() {
    const [filtro, setFiltro] = useState('cartelera');
    const [ciudad, setCiudad] = useState('Todas');
    const [cine, setCine] = useState('Todos');
    const [dia, setDia] = useState('Hoy');
    const [genero, setGenero] = useState('Todos');
    const [idioma, setIdioma] = useState('Todos');
    const [formato, setFormato] = useState('Todos');
    const [clasificacion, setClasificacion] = useState('Todos');

    // Extraer opciones únicas
    const ciudades = ['Todas', ...new Set(peliculasEnCartelera.map(p => p.sedes[0]))];
    const cines = ['Todos', ...new Set(peliculasEnCartelera.flatMap(p => p.sedes))];
    const generos = ['Todos', ...new Set(peliculasEnCartelera.flatMap(p => p.genero.split(', ').map(g => g.trim())))];
    const idiomas = ['Todos', ...new Set(peliculasEnCartelera.map(p => p.idioma || 'Español Latino'))];
    const formatos = ['Todos', ...new Set(peliculasEnCartelera.map(p => p.formato || '2D'))];
    const clasificaciones = ['Todos', ...new Set(peliculasEnCartelera.map(p => p.clasificacion || 'G'))];

    let peliculas = filtro === 'cartelera' ? peliculasEnCartelera : proximosEstrenos;

    // Aplicar filtros
    if (ciudad !== 'Todas') {
        peliculas = peliculas.filter(p => p.sedes.includes(ciudad));
    }
    if (cine !== 'Todos') {
        peliculas = peliculas.filter(p => p.sedes.includes(cine));
    }
    if (genero !== 'Todos') {
        peliculas = peliculas.filter(p => p.genero.includes(genero));
    }
    if (idioma !== 'Todos') {
        peliculas = peliculas.filter(p => (p.idioma || 'Español Latino').includes(idioma));
    }
    if (formato !== 'Todos') {
        peliculas = peliculas.filter(p => (p.formato || '2D').includes(formato));
    }
    if (clasificacion !== 'Todos') {
        peliculas = peliculas.filter(p => p.clasificacion === clasificacion);
    }

    return (
        <div className="movies">
            <aside className="filters">
                <h3>Filtros</h3>
                <div className="filter-group">
                    <label>Estado:</label>
                    <div>
                        <label><input type="radio" name="filtro" value="cartelera" checked={filtro === 'cartelera'} onChange={() => setFiltro('cartelera')} /> En Cartelera</label>
                        <label><input type="radio" name="filtro" value="estrenos" checked={filtro === 'estrenos'} onChange={() => setFiltro('estrenos')} /> Próximos Estrenos</label>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Ciudad:</label>
                    <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                        {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Cine:</label>
                    <select value={cine} onChange={(e) => setCine(e.target.value)}>
                        {cines.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Día:</label>
                    <select value={dia} onChange={(e) => setDia(e.target.value)}>
                        <option>Hoy</option>
                        <option>Mañana</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Género:</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                        {generos.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Idioma:</label>
                    <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                        {idiomas.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Formato:</label>
                    <select value={formato} onChange={(e) => setFormato(e.target.value)}>
                        {formatos.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Clasificación:</label>
                    <select value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}>
                        {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </aside>

            <main style={{ flex: 1, minWidth: '0' }}>
                <div className="movie-grid">
                    {peliculas.map((p) => (
                        <MovieCard key={p.id} pelicula={p} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Movies;
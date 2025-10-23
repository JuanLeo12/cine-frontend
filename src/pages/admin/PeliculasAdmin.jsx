import React, { useState, useEffect } from 'react';
import { getPeliculas, createPelicula, updatePelicula, deletePelicula } from '../../services/api';

function PeliculasAdmin() {
    const [peliculas, setPeliculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [peliculaEditando, setPeliculaEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const [form, setForm] = useState({
        titulo: '',
        genero: '',
        clasificacion: 'PG',
        duracion: '',
        fecha_estreno: '',
        sinopsis: '',
        imagen_url: '',
        tipo: 'cartelera',
    });

    useEffect(() => {
        cargarPeliculas();
    }, []);

    const cargarPeliculas = async () => {
        try {
            const data = await getPeliculas();
            setPeliculas(data);
        } catch (error) {
            console.error('Error al cargar películas:', error);
            alert('Error al cargar películas');
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (pelicula = null) => {
        if (pelicula) {
            setPeliculaEditando(pelicula);
            // Formatear fecha correctamente para el input date
            const fecha = pelicula.fecha_estreno.split('T')[0];
            setForm({
                titulo: pelicula.titulo,
                genero: pelicula.genero,
                clasificacion: pelicula.clasificacion,
                duracion: pelicula.duracion,
                fecha_estreno: fecha,
                sinopsis: pelicula.sinopsis,
                imagen_url: pelicula.imagen_url,
                tipo: pelicula.tipo,
            });
        } else {
            setPeliculaEditando(null);
            setForm({
                titulo: '',
                genero: '',
                clasificacion: 'PG',
                duracion: '',
                fecha_estreno: '',
                sinopsis: '',
                imagen_url: '',
                tipo: 'cartelera',
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setPeliculaEditando(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (peliculaEditando) {
                await updatePelicula(peliculaEditando.id, form);
                alert('Película actualizada exitosamente');
            } else {
                await createPelicula(form);
                alert('Película creada exitosamente');
            }
            cerrarModal();
            cargarPeliculas();
        } catch (error) {
            console.error('Error al guardar película:', error);
            alert('Error al guardar película: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta película?')) return;
        
        try {
            await deletePelicula(id);
            alert('Película eliminada exitosamente');
            cargarPeliculas();
        } catch (error) {
            console.error('Error al eliminar película:', error);
            alert('Error al eliminar película');
        }
    };

    const peliculasFiltradas = peliculas.filter(p =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.genero.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) {
        return <div className="loading-spinner">Cargando películas...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Películas</h2>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    + Nueva Película
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Buscar por título o género..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {peliculasFiltradas.length === 0 ? (
                <div className="no-data">No hay películas registradas</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>Género</th>
                            <th>Clasificación</th>
                            <th>Duración</th>
                            <th>Tipo</th>
                            <th>Estreno</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {peliculasFiltradas.map((pelicula) => (
                            <tr key={pelicula.id}>
                                <td>
                                    <img src={pelicula.imagen_url} alt={pelicula.titulo} />
                                </td>
                                <td>{pelicula.titulo}</td>
                                <td>{pelicula.genero}</td>
                                <td>{pelicula.clasificacion}</td>
                                <td>{pelicula.duracion} min</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: pelicula.tipo === 'cartelera' ? '#4caf50' : '#ff9800',
                                        fontSize: '0.85rem'
                                    }}>
                                        {pelicula.tipo === 'cartelera' ? 'En Cartelera' : 'Próximo Estreno'}
                                    </span>
                                </td>
                                <td>{new Date(pelicula.fecha_estreno).toLocaleDateString('es-PE')}</td>
                                <td>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => abrirModal(pelicula)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleEliminar(pelicula.id)}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{peliculaEditando ? 'Editar Película' : 'Nueva Película'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.titulo}
                                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Género *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.genero}
                                    onChange={(e) => setForm({ ...form, genero: e.target.value })}
                                    placeholder="Ej: Acción, Comedia, Drama"
                                />
                            </div>

                            <div className="form-group">
                                <label>Clasificación *</label>
                                <select
                                    required
                                    value={form.clasificacion}
                                    onChange={(e) => setForm({ ...form, clasificacion: e.target.value })}
                                >
                                    <option value="G">G - Todo público</option>
                                    <option value="PG">PG - Guía paterna sugerida</option>
                                    <option value="PG-13">PG-13 - Mayores de 13 años</option>
                                    <option value="R">R - Mayores de 18 años</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Duración (minutos) *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={form.duracion}
                                    onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha de Estreno *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.fecha_estreno}
                                    onChange={(e) => setForm({ ...form, fecha_estreno: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo *</label>
                                <select
                                    required
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                >
                                    <option value="cartelera">En Cartelera</option>
                                    <option value="proxEstreno">Próximo Estreno</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>URL de Imagen *</label>
                                <input
                                    type="url"
                                    required
                                    value={form.imagen_url}
                                    onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label>Sinopsis *</label>
                                <textarea
                                    required
                                    value={form.sinopsis}
                                    onChange={(e) => setForm({ ...form, sinopsis: e.target.value })}
                                    placeholder="Escribe una breve descripción de la película..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {peliculaEditando ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PeliculasAdmin;

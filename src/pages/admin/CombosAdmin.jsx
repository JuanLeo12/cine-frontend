import React, { useState, useEffect } from 'react';
import { getCombos, createCombo, updateCombo, deleteCombo } from '../../services/api';

function CombosAdmin() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [comboEditando, setComboEditando] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
    });

    useEffect(() => {
        cargarCombos();
    }, []);

    const cargarCombos = async () => {
        try {
            const data = await getCombos();
            setCombos(data);
        } catch (error) {
            console.error('Error al cargar combos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (combo = null) => {
        if (combo) {
            setComboEditando(combo);
            setForm({
                nombre: combo.nombre,
                descripcion: combo.descripcion,
                precio: combo.precio,
                imagen_url: combo.imagen_url,
            });
        } else {
            setComboEditando(null);
            setForm({
                nombre: '',
                descripcion: '',
                precio: '',
                imagen_url: '',
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setComboEditando(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (comboEditando) {
                await updateCombo(comboEditando.id, form);
                alert('Combo actualizado exitosamente');
            } else {
                await createCombo(form);
                alert('Combo creado exitosamente');
            }
            cerrarModal();
            cargarCombos();
        } catch (error) {
            console.error('Error al guardar combo:', error);
            alert('Error al guardar combo');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este combo?')) return;
        
        try {
            await deleteCombo(id);
            alert('Combo eliminado exitosamente');
            cargarCombos();
        } catch (error) {
            console.error('Error al eliminar combo:', error);
            alert('Error al eliminar combo');
        }
    };

    if (loading) {
        return <div className="loading-spinner">Cargando combos...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Combos</h2>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    + Nuevo Combo
                </button>
            </div>

            {combos.length === 0 ? (
                <div className="no-data">No hay combos registrados</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combos.map((combo) => (
                            <tr key={combo.id}>
                                <td>
                                    <img src={combo.imagen_url} alt={combo.nombre} />
                                </td>
                                <td>{combo.nombre}</td>
                                <td>{combo.descripcion}</td>
                                <td>S/ {combo.precio}</td>
                                <td>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => abrirModal(combo)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleEliminar(combo.id)}
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
                        <h3>{comboEditando ? 'Editar Combo' : 'Nuevo Combo'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción *</label>
                                <textarea
                                    required
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Precio (S/) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.precio}
                                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>URL de Imagen *</label>
                                <input
                                    type="url"
                                    required
                                    value={form.imagen_url}
                                    onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {comboEditando ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CombosAdmin;

import React, { useState, useEffect } from 'react';
import { getSedes, createSede, updateSede, deleteSede } from '../../services/api';
import './css/SedesAdmin.css';

function SedesAdmin() {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        ciudad: '',
        telefono: '',
        imagen_url: '',
        cantidadSalas: 0,
        salas: []
    });

    useEffect(() => {
        cargarSedes();
    }, []);

    const cargarSedes = async () => {
        try {
            const data = await getSedes();
            setSedes(data);
        } catch (error) {
            console.error('Error al cargar sedes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cantidadSalas') {
            const cantidad = parseInt(value) || 0;
            const nuevasSalas = Array.from({ length: cantidad }, (_, i) => ({
                nombre: `Sala ${i + 1}`,
                tipo_sala: '2D',
                filas: 10,
                columnas: 12
            }));
            setFormData(prev => ({ 
                ...prev, 
                cantidadSalas: cantidad,
                salas: nuevasSalas
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSalaChange = (index, field, value) => {
        setFormData(prev => {
            const nuevasSalas = [...prev.salas];
            nuevasSalas[index] = { ...nuevasSalas[index], [field]: value };
            return { ...prev, salas: nuevasSalas };
        });
    };

    const resetForm = () => {
        setFormData({ 
            nombre: '', 
            direccion: '', 
            ciudad: '', 
            telefono: '', 
            imagen_url: '',
            cantidadSalas: 0,
            salas: []
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingId) {
                await updateSede(editingId, formData);
                alert('Sede actualizada correctamente');
            } else {
                await createSede(formData);
                alert('Sede creada correctamente');
            }
            resetForm();
            cargarSedes();
        } catch (error) {
            console.error('Error al guardar sede:', error);
            alert(error.response?.data?.error || 'Error al guardar sede');
        }
    };

    const handleEdit = (sede) => {
        setFormData({
            nombre: sede.nombre,
            direccion: sede.direccion,
            ciudad: sede.ciudad,
            telefono: sede.telefono || '',
            imagen_url: sede.imagen_url || '',
            cantidadSalas: sede.salas?.length || 0,
            salas: sede.salas?.map(s => ({
                nombre: s.nombre,
                tipo_sala: s.tipo_sala || '2D',
                filas: s.filas || 10,
                columnas: s.columnas || 12
            })) || []
        });
        setEditingId(sede.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sede?')) return;
        
        try {
            await deleteSede(id);
            alert('Sede eliminada correctamente');
            cargarSedes();
        } catch (error) {
            console.error('Error al eliminar sede:', error);
            alert(error.response?.data?.error || 'Error al eliminar sede');
        }
    };

    if (loading) {
        return <div className="loading-spinner">Cargando sedes...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Sedes</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancelar' : '+ Nueva Sede'}
                </button>
            </div>

            {showForm && (
                <div className="form-container">
                    <h3>{editingId ? 'Editar Sede' : 'Nueva Sede'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ciudad *</label>
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Dirección *</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        // Solo permitir números y máximo 9 dígitos
                                        if (/^\d{0,9}$/.test(valor)) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    placeholder="987654321"
                                    maxLength="9"
                                    pattern="\d{9}"
                                    title="Ingrese exactamente 9 dígitos"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>URL de Imagen</label>
                                <input
                                    type="text"
                                    name="imagen_url"
                                    value={formData.imagen_url}
                                    onChange={handleInputChange}
                                    placeholder="https://ejemplo.com/imagen-sede.jpg"
                                />
                                {formData.imagen_url && (
                                    <div className="image-preview">
                                        <img 
                                            src={formData.imagen_url} 
                                            alt="Vista previa" 
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* 🔹 Sección de Salas (solo al crear nueva sede) */}
                            {!editingId && (
                                <div className="form-group full-width">
                                    <label>Cantidad de Salas</label>
                                    <input
                                        type="number"
                                        name="cantidadSalas"
                                        value={formData.cantidadSalas}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="20"
                                    />
                                </div>
                            )}
                            
                            {/* 🔹 Configuración de cada sala */}
                            {!editingId && formData.cantidadSalas > 0 && (
                                <div className="form-group full-width">
                                    <label>Configuración de Salas</label>
                                    <div className="salas-config">
                                        {formData.salas.map((sala, index) => (
                                            <div key={index} className="sala-item">
                                                <span className="sala-nombre">{sala.nombre}</span>
                                                <select
                                                    value={sala.tipo_sala}
                                                    onChange={(e) => handleSalaChange(index, 'tipo_sala', e.target.value)}
                                                >
                                                    <option value="2D">2D</option>
                                                    <option value="3D">3D</option>
                                                    <option value="4DX">4DX</option>
                                                    <option value="Xtreme">Xtreme</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Actualizar' : 'Crear'} Sede
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {sedes.length === 0 ? (
                <div className="no-data">No hay sedes registradas</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Ciudad</th>
                            <th>Teléfono</th>
                            <th>Salas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sedes.map((sede) => (
                            <tr key={sede.id}>
                                <td>
                                    {sede.imagen_url ? (
                                        <img 
                                            src={sede.imagen_url} 
                                            alt={sede.nombre}
                                            className="sede-thumbnail"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <span className="no-image" style={{ display: sede.imagen_url ? 'none' : 'block' }}>
                                        Sin imagen
                                    </span>
                                </td>
                                <td>{sede.nombre}</td>
                                <td>{sede.direccion}</td>
                                <td>{sede.ciudad}</td>
                                <td>{sede.telefono || 'N/A'}</td>
                                <td>{sede.salas?.length || 0} salas</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(sede)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(sede.id)}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SedesAdmin;

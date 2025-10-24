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
        telefono: ''
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ nombre: '', direccion: '', ciudad: '', telefono: '' });
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
            telefono: sede.telefono || ''
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
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                />
                            </div>
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

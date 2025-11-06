import React, { useState, useEffect } from 'react';
import { getTodasLasSedes, createSede, updateSede, deleteSede, reactivarSede } from '../../services/api';
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
    const [advertenciaImpacto, setAdvertenciaImpacto] = useState(null);
    const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

    useEffect(() => {
        cargarSedes();
    }, []);

    const cargarSedes = async () => {
        try {
            const data = await getTodasLasSedes();
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

    const agregarSala = () => {
        setFormData(prev => {
            // Calcular el número de la nueva sala basándose en el total de salas existentes
            const numeroNuevaSala = prev.salas.length + 1;
            return {
                ...prev,
                cantidadSalas: prev.cantidadSalas + 1,
                salas: [...prev.salas, {
                    nombre: `Sala ${numeroNuevaSala}`,
                    tipo_sala: '2D',
                    filas: 10,
                    columnas: 12
                }]
            };
        });
    };

    const eliminarSala = (index) => {
        const sala = formData.salas[index];
        
        // Si la sala tiene ID (existe en BD), advertir
        if (sala.id && !window.confirm(`¿Eliminar ${sala.nombre}? Las funciones asociadas se desactivarán.`)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            cantidadSalas: prev.cantidadSalas - 1,
            salas: prev.salas.filter((_, i) => i !== index)
        }));
        
        // Limpiar advertencia si existía
        setAdvertenciaImpacto(null);
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
        setAdvertenciaImpacto(null);
        setConfirmarEliminacion(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingId) {
                const dataToSend = { ...formData };
                if (confirmarEliminacion) {
                    dataToSend.confirmarEliminacion = true;
                }
                
                await updateSede(editingId, dataToSend);
                alert('Sede actualizada correctamente');
                resetForm();
                cargarSedes();
            } else {
                await createSede(formData);
                alert('Sede creada correctamente');
                resetForm();
                cargarSedes();
            }
        } catch (error) {
            console.error('Error al guardar sede:', error);
            
            // Si hay funciones afectadas, mostrar advertencia
            if (error.response?.data?.requiereConfirmacion) {
                setAdvertenciaImpacto({
                    mensaje: error.response.data.mensaje,
                    funcionesAfectadas: error.response.data.funcionesAfectadas
                });
            } else {
                alert(error.response?.data?.error || 'Error al guardar sede');
            }
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
                id: s.id, // Importante: incluir el ID para actualizar
                nombre: s.nombre,
                tipo_sala: s.tipo_sala || '2D',
                filas: s.filas || 10,
                columnas: s.columnas || 12
            })) || []
        });
        setEditingId(sede.id);
        setShowForm(true);
        setAdvertenciaImpacto(null);
        setConfirmarEliminacion(false);
    };

    const handleDelete = async (id) => {
        // Primera confirmación
        if (!window.confirm('¿Estás seguro de inactivar esta sede?')) {
            return;
        }
        
        try {
            // Obtener información de la sede para verificar funciones
            const sede = sedes.find(s => s.id === id);
            const totalSalas = sede.salas?.length || 0;
            
            if (totalSalas > 0) {
                // Segunda confirmación más específica
                const mensaje = `⚠️ ADVERTENCIA FINAL\n\nAl inactivar esta sede:\n\n✓ La sede quedará INACTIVA (recuperable más tarde)\n✗ Se ELIMINARÁN ${totalSalas} sala(s): ${sede.salas.map(s => s.nombre).join(', ')}\n✗ Se ELIMINARÁN todas las funciones programadas\n✗ Salas y funciones NO se pueden recuperar\n\n🔄 Podrás reactivar la sede después, pero tendrás que crear salas nuevamente.\n\n¿Continuar?`;
                
                if (!window.confirm(mensaje)) {
                    return;
                }
            }
            
            const response = await deleteSede(id);
            
            // Mostrar mensaje con detalles de lo que se eliminó
            const funcionesEliminadas = response.data?.funcionesEliminadas || 0;
            const salasEliminadas = response.data?.salasEliminadas || 0;
            
            let mensajeResultado = '✅ Sede inactivada correctamente';
            if (salasEliminadas > 0 || funcionesEliminadas > 0) {
                mensajeResultado += `\n\n📊 Resumen:\n- ${salasEliminadas} sala(s) eliminada(s)\n- ${funcionesEliminadas} función(es) eliminada(s)\n\n🔄 Usa "Reactivar" cuando quieras volver a usar esta sede.`;
            }
            
            alert(mensajeResultado);
            cargarSedes();
        } catch (error) {
            console.error('Error al eliminar sede:', error);
            alert(error.response?.data?.error || 'Error al eliminar sede');
        }
    };

    const handleReactivar = async (id) => {
        if (!window.confirm('¿Reactivar esta sede? Podrás crear salas desde el panel de edición.')) {
            return;
        }

        try {
            await reactivarSede(id);
            alert('✅ Sede reactivada correctamente\n\n💡 Ahora edita la sede para agregar salas.');
            cargarSedes();
        } catch (error) {
            console.error('Error al reactivar sede:', error);
            alert(error.response?.data?.error || 'Error al reactivar sede');
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
                            
                            {/* 🔹 Gestión de Salas */}
                            <div className="form-group full-width">
                                <label>Salas de la Sede</label>
                                {editingId && (
                                    <p className="help-text">
                                        ⚠️ Editar o eliminar salas puede afectar funciones activas
                                    </p>
                                )}
                                <button 
                                    type="button" 
                                    onClick={agregarSala}
                                    className="btn-add-sala"
                                >
                                    ➕ Agregar Sala
                                </button>
                            </div>
                            
                            {/* 🔹 Configuración de cada sala */}
                            {formData.salas.length > 0 && (
                                <div className="form-group full-width">
                                    <label>Configuración de Salas</label>
                                    <div className="salas-config">
                                        {formData.salas.map((sala, index) => (
                                            <div key={index} className="sala-item">
                                                <input
                                                    type="text"
                                                    value={sala.nombre || `Sala ${index + 1}`}
                                                    onChange={(e) => handleSalaChange(index, 'nombre', e.target.value)}
                                                    placeholder="Nombre de la sala"
                                                    className="sala-nombre-input"
                                                />
                                                <select
                                                    value={sala.tipo_sala || '2D'}
                                                    onChange={(e) => handleSalaChange(index, 'tipo_sala', e.target.value)}
                                                >
                                                    <option value="2D">2D</option>
                                                    <option value="3D">3D</option>
                                                    <option value="4DX">4DX</option>
                                                    <option value="Xtreme">Xtreme</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarSala(index)}
                                                    className="btn-remove-sala"
                                                    title="Eliminar sala"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ⚠️ Advertencia de impacto */}
                            {advertenciaImpacto && (
                                <div className="form-group full-width">
                                    <div className="advertencia-impacto">
                                        <h4>⚠️ Advertencia</h4>
                                        <p>{advertenciaImpacto.mensaje}</p>
                                        <p>Se desactivarán {advertenciaImpacto.funcionesAfectadas} funciones activas.</p>
                                        <div className="advertencia-actions">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setConfirmarEliminacion(true);
                                                    setAdvertenciaImpacto(null);
                                                }}
                                                className="btn-warning"
                                            >
                                                Continuar de todas formas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAdvertenciaImpacto(null);
                                                    setConfirmarEliminacion(false);
                                                }}
                                                className="btn-secondary"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
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
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sedes.map((sede) => (
                            <tr key={sede.id} className={sede.estado === 'inactivo' ? 'sede-inactiva' : ''}>
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
                                <td>
                                    <span className={`badge badge-${sede.estado}`}>
                                        {sede.estado === 'activo' ? '✅ Activa' : '❌ Inactiva'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {sede.estado === 'activo' ? (
                                        <>
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
                                                title="Inactivar"
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn-reactivar"
                                            onClick={() => handleReactivar(sede.id)}
                                            title="Reactivar sede"
                                        >
                                            � Reactivar
                                        </button>
                                    )}
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

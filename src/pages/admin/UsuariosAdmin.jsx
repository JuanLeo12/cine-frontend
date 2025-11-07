import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { updateUsuario } from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleEditar = (usuario) => {
        setEditando(usuario.id);
        setFormData({
            nombre: usuario.nombre,
            apellido: usuario.apellido || '',
            email: usuario.email,
            dni: usuario.dni || '',
            telefono: usuario.telefono || '',
            direccion: usuario.direccion || '',
            rol: usuario.rol,
            estado: usuario.estado
        });
    };

    const handleCancelar = () => {
        setEditando(null);
        setFormData({});
    };

    const handleGuardar = async (id) => {
        try {
            await updateUsuario(id, formData);
            alert('✅ Usuario actualizado correctamente');
            setEditando(null);
            setFormData({});
            cargarUsuarios();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            alert('❌ Error: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) {
        return <div className="loading-spinner">Cargando usuarios...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Usuarios</h2>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {usuariosFiltrados.length === 0 ? (
                <div className="no-data">No hay usuarios registrados</div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            editando === usuario.id ? (
                                <tr key={usuario.id} className="editing-row">
                                    <td>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                            style={{ width: '100%', padding: '4px' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            style={{ width: '100%', padding: '4px' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                            style={{ width: '100%', padding: '4px' }}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={formData.rol}
                                            onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                            style={{ width: '100%', padding: '4px' }}
                                        >
                                            <option value="cliente">cliente</option>
                                            <option value="corporativo">corporativo</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={formData.estado}
                                            onChange={(e) => setFormData({...formData, estado: e.target.value})}
                                            style={{ width: '100%', padding: '4px' }}
                                        >
                                            <option value="activo">activo</option>
                                            <option value="inactivo">inactivo</option>
                                        </select>
                                    </td>
                                    <td>{new Date(usuario.fecha_registro).toLocaleDateString('es-PE')}</td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleGuardar(usuario.id)}
                                            className="btn-edit"
                                            title="Guardar"
                                        >
                                            ✅
                                        </button>
                                        <button
                                            onClick={handleCancelar}
                                            className="btn-delete"
                                            title="Cancelar"
                                        >
                                            ❌
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={usuario.id}>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.email}</td>
                                    <td>{usuario.telefono || 'N/A'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 
                                                usuario.rol === 'admin' ? '#e60000' :
                                                usuario.rol === 'corporativo' ? '#ff9800' : '#4caf50',
                                            fontSize: '0.85rem'
                                        }}>
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: usuario.estado === 'activo' ? '#4caf50' : '#9e9e9e',
                                            fontSize: '0.85rem'
                                        }}>
                                            {usuario.estado}
                                        </span>
                                    </td>
                                    <td>{new Date(usuario.fecha_registro).toLocaleDateString('es-PE')}</td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleEditar(usuario)}
                                            className="btn-edit"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsuariosAdmin;

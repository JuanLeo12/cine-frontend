import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/usuarios', {
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
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.email}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsuariosAdmin;

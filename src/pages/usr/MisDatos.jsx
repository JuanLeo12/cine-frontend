import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePerfil } from '../../services/api';
import './css/MisDatos.css';

function MisDatos() {
    const { user, setUser } = useAuth();

    const [nombre, setNombre] = useState(user?.nombre || '');
    const [email, setEmail] = useState(user?.email || '');
    const [telefono, setTelefono] = useState(user?.telefono || '');
    const [loading, setLoading] = useState(false);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const datosActualizados = await updatePerfil({ nombre, email, telefono });
            setUser(datosActualizados);
            alert('Datos actualizados correctamente.');
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            alert('Error al actualizar los datos: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mis-datos">
            <h2>Mis Datos</h2>
            <form onSubmit={handleGuardar}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                        id="telefono"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                    />
                </div>
                <button type="submit" className="guardar-btn" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}

export default MisDatos;
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarios } from '../../data/mockData';
import './css/MisDatos.css';

function MisDatos() {
    const { user, login } = useAuth();

    const [nombre, setNombre] = useState(user.nombre);
    const [email, setEmail] = useState(user.email);
    const [telefono, setTelefono] = useState(user.telefono);

    const handleGuardar = (e) => {
        e.preventDefault();
        // Simular actualización en el backend
        alert('Datos actualizados correctamente.');
        // En una app real, aquí harías una petición PUT a tu API
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
                        required
                    />
                </div>
                <button type="submit" className="guardar-btn">Guardar Cambios</button>
            </form>
        </div>
    );
}

export default MisDatos;
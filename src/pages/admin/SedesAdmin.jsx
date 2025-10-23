import React, { useState, useEffect } from 'react';
import { getSedes } from '../../services/api';

function SedesAdmin() {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="loading-spinner">Cargando sedes...</div>;
    }

    return (
        <div>
            <div className="section-header">
                <h2>Gestión de Sedes</h2>
            </div>

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
                        </tr>
                    </thead>
                    <tbody>
                        {sedes.map((sede) => (
                            <tr key={sede.id}>
                                <td>{sede.nombre}</td>
                                <td>{sede.direccion}</td>
                                <td>{sede.ciudad}</td>
                                <td>{sede.telefono}</td>
                                <td>{sede.Salas?.length || 0} salas</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SedesAdmin;

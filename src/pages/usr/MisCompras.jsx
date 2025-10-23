import React, { useState, useEffect } from 'react';
import { getOrdenesUsuario } from '../../services/api';
import './css/MisCompras.css';

function MisCompras() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            const data = await getOrdenesUsuario();
            setOrdenes(data);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando compras...</div>;
    }

    return (
        <div className="mis-compras">
            <h2>Mis Compras</h2>
            {ordenes.length === 0 ? (
                <p>No tienes compras registradas aún.</p>
            ) : (
                <div className="compras-list">
                    {ordenes.map(orden => (
                        <div key={orden.id} className="compra-card">
                            <h3>Orden #{orden.id}</h3>
                            <p><strong>Fecha:</strong> {new Date(orden.fecha_compra).toLocaleString('es-PE')}</p>
                            <p><strong>Estado:</strong> <span className={`estado-${orden.estado}`}>{orden.estado}</span></p>
                            
                            {orden.OrdenTickets && orden.OrdenTickets.length > 0 && (
                                <>
                                    <p><strong>Tickets:</strong></p>
                                    <ul>
                                        {orden.OrdenTickets.map((ot) => (
                                            <li key={ot.id}>
                                                {ot.Ticket?.Funcion?.Pelicula?.titulo || 'N/A'} - 
                                                Asiento: {ot.Ticket?.AsientoFuncion?.asiento || 'N/A'} - 
                                                S/ {ot.precio_unitario}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            {orden.OrdenCombos && orden.OrdenCombos.length > 0 && (
                                <>
                                    <p><strong>Combos:</strong></p>
                                    <ul>
                                        {orden.OrdenCombos.map((oc) => (
                                            <li key={oc.id}>
                                                {oc.Combo?.nombre || 'N/A'} x{oc.cantidad} - 
                                                S/ {(oc.precio_unitario * oc.cantidad).toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <p><strong>Total:</strong> S/ {orden.total.toFixed(2)}</p>
                            {orden.Pago && (
                                <p><strong>Método de Pago:</strong> {orden.Pago.MetodoPago?.nombre || 'N/A'}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisCompras;
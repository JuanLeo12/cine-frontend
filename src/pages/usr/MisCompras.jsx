// src/pages/MisCompras.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { compras } from '../../data/mockData';
import './css/MisCompras.css';

function MisCompras() {
    const { user } = useAuth();

    const comprasUsuario = compras.filter(c => c.usuarioId === user.id);

    return (
        <div className="mis-compras">
            <h2>Mis Compras</h2>
            {comprasUsuario.length === 0 ? (
                <p>No tienes compras registradas aún.</p>
            ) : (
                <div className="compras-list">
                    {comprasUsuario.map(compra => (
                        <div key={compra.id} className="compra-card">
                            <h3>Compra #{compra.id}</h3>
                            <p><strong>Película:</strong> {compra.pelicula}</p>
                            <p><strong>Sede:</strong> {compra.sede}</p>
                            <p><strong>Fecha:</strong> {compra.fecha}</p>
                            <p><strong>Horario:</strong> {compra.horario}</p>
                            <p><strong>Asientos:</strong> {compra.asientos.join(', ')}</p>
                            <p><strong>Tipo de Entradas:</strong></p>
                            <ul>
                                {compra.tipoEntradas.map((t, i) => (
                                    <li key={i}>{t.asiento}: {t.tipo} - S/. {t.precio.toFixed(2)}</li>
                                ))}
                            </ul>
                            {compra.combos.length > 0 && (
                                <>
                                    <p><strong>Combos:</strong></p>
                                    <ul>
                                        {compra.combos.map((c, i) => (
                                            <li key={i}>{c.nombre} x{c.cantidad} - S/. {(c.precio * c.cantidad).toFixed(2)}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            <p><strong>Total Pagado:</strong> S/. {compra.total.toFixed(2)}</p>
                            <p><strong>Método de Pago:</strong> {compra.metodoPago}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisCompras;
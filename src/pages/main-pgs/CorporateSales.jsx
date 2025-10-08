import React, { useState } from 'react';
import { ventasCorporativas } from '../../data/mockData';
import './css/CorporateSales.css';

function CorporateSales() {
    const [formularioAbierto, setFormularioAbierto] = useState(null);

    const abrirFormulario = (id) => {
        setFormularioAbierto(id);
    };

    const cerrarFormulario = () => {
        setFormularioAbierto(null);
    };

    return (
        <div className="corporate-sales">
            <h1>Ventas Corporativas</h1>
            <div className="corporate-grid">
                {ventasCorporativas.map(item => (
                    <div key={item.id} className="corporate-card">
                        <img src={item.imagen} alt={item.titulo} />
                        <h3>{item.titulo}</h3>
                        <p>{item.descripcion}</p>
                        <button onClick={() => abrirFormulario(item.id)}>Solicitar</button>
                    </div>
                ))}
            </div>

            {formularioAbierto && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Solicitud de {ventasCorporativas.find(v => v.id === formularioAbierto)?.titulo}</h3>
                        <form>
                            <input type="text" placeholder="Nombre" required />
                            <input type="email" placeholder="Correo" required />
                            <textarea placeholder="Mensaje" required></textarea>
                            <button type="submit">Enviar Solicitud</button>
                            <button type="button" onClick={cerrarFormulario}>Cerrar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CorporateSales;
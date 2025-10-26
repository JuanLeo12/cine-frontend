import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMetodosPago, createOrdenCompra, confirmarOrdenCompra } from '../../services/api';
import './css/Payment.css';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { selectedSeats, funcion, pelicula, tickets, subtotalTickets } = location.state || {};

    const [metodosPago, setMetodosPago] = useState([]);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);

    // Formulario Tarjeta
    const [tarjeta, setTarjeta] = useState({
        numero: '',
        nombre: '',
        expiracion: '',
        cvv: ''
    });

    // Formulario Yape
    const [yape, setYape] = useState({
        telefono: '',
        codigo: ''
    });

    useEffect(() => {
        if (!selectedSeats || !funcion || !tickets) {
            alert('Datos incompletos. Regresando...');
            navigate('/movies');
            return;
        }
        cargarMetodosPago();
        
        // Advertencia al salir de la página
        const handleBeforeUnload = (e) => {
            if (!procesando) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [procesando]);

    const cargarMetodosPago = async () => {
        try {
            const metodos = await getMetodosPago();
            setMetodosPago(metodos);
            if (metodos.length > 0) {
                setMetodoSeleccionado(metodos[0].id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error cargando métodos de pago:', error);
            alert('Error al cargar métodos de pago');
            setLoading(false);
        }
    };

    const validarFormulario = () => {
        const metodo = metodosPago.find(m => m.id === metodoSeleccionado);
        
        if (metodo?.nombre.includes('Tarjeta')) {
            if (!tarjeta.numero || tarjeta.numero.length < 16) {
                alert('Número de tarjeta inválido');
                return false;
            }
            if (!tarjeta.nombre.trim()) {
                alert('Ingresa el nombre del titular');
                return false;
            }
            if (!tarjeta.expiracion || !/^\d{2}\/\d{2}$/.test(tarjeta.expiracion)) {
                alert('Formato de expiración inválido (MM/AA)');
                return false;
            }
            if (!tarjeta.cvv || tarjeta.cvv.length < 3) {
                alert('CVV inválido');
                return false;
            }
        }

        if (metodo?.nombre === 'Yape') {
            if (!yape.telefono || yape.telefono.length !== 9) {
                alert('Número de teléfono inválido');
                return false;
            }
            if (!yape.codigo || yape.codigo.length < 6) {
                alert('Código de confirmación inválido');
                return false;
            }
        }

        return true;
    };

    const handlePagar = async () => {
        if (!validarFormulario()) return;

        setProcesando(true);

        try {
            console.log('🔄 Iniciando proceso de pago...');
            console.log('📦 Datos de entrada:', { selectedSeats, funcion, pelicula, tickets, metodoSeleccionado });

            // 1. Crear orden pendiente
            const ordenResponse = await createOrdenCompra({
                id_funcion: funcion.id
            });

            console.log('✅ Orden creada:', ordenResponse);
            const ordenId = ordenResponse.orden.id;

            // 2. Simular procesamiento de pago (2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Preparar datos para confirmar
            const confirmData = {
                tickets,
                combos: [], // Sin combos por ahora
                metodo_pago: metodoSeleccionado,
                asientos: selectedSeats.map(s => ({ fila: s.fila, numero: s.numero }))
            };

            console.log('📤 Confirmando orden con:', confirmData);

            // 4. Confirmar orden (marcar asientos como ocupados)
            const confirmResponse = await confirmarOrdenCompra(ordenId, confirmData);

            console.log('✅ Orden confirmada:', confirmResponse);

            // 5. Navegar a confirmación
            navigate('/confirmation', {
                state: {
                    orden: confirmResponse.orden,
                    pago: confirmResponse.pago,
                    pelicula,
                    funcion,
                    selectedSeats,
                    tickets
                }
            });

        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            console.error('Detalles del error:', error.response?.data);
            alert(error.response?.data?.error || 'Error al procesar el pago. Intenta nuevamente.');
            setProcesando(false);
        }
    };

    const handleBack = () => {
        const confirmBack = window.confirm(
            '⚠️ Si retrocedes, tendrás que volver a seleccionar el tipo de tickets. ¿Deseas continuar?'
        );
        if (confirmBack) {
            navigate(-1);
        }
    };

    if (loading) {
        return <div className="payment-page"><p>Cargando métodos de pago...</p></div>;
    }

    const metodoActual = metodosPago.find(m => m.id === metodoSeleccionado);

    return (
        <div className="payment-page">
            <div className="payment-header">
                <h2>💳 Método de Pago</h2>
                <p className="payment-note">🔒 Esta es una simulación. No se procesará ningún pago real.</p>
            </div>

            <div className="payment-container">
                {/* Resumen de Compra */}
                <div className="order-summary">
                    <h3>Resumen de Compra</h3>
                    
                    <div className="summary-section">
                        <h4>Película</h4>
                        <p><strong>{pelicula?.titulo}</strong></p>
                        <p>{funcion?.fecha} - {funcion?.hora}</p>
                    </div>

                    <div className="summary-section">
                        <h4>Asientos</h4>
                        <p>{selectedSeats.map(s => s.id).join(', ')}</p>
                    </div>

                    <div className="summary-section">
                        <h4>Tickets</h4>
                        {tickets.map((ticket, index) => {
                            const tipoNombre = metodosPago.length > 0 ? 
                                `Ticket ${index + 1}` : ticket.id_tipo_ticket;
                            return (
                                <div key={index} className="summary-item">
                                    <span>{ticket.cantidad}x {tipoNombre}</span>
                                    <span>S/ {(ticket.cantidad * ticket.precio_unitario).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="summary-total">
                        <span>TOTAL</span>
                        <strong>S/ {subtotalTickets.toFixed(2)}</strong>
                    </div>
                </div>

                {/* Formulario de Pago */}
                <div className="payment-form-container">
                    <h3>Selecciona Método de Pago</h3>
                    
                    <div className="payment-methods">
                        {metodosPago.map((metodo) => (
                            <button
                                key={metodo.id}
                                className={`payment-method-btn ${metodoSeleccionado === metodo.id ? 'active' : ''}`}
                                onClick={() => setMetodoSeleccionado(metodo.id)}
                            >
                                {metodo.nombre === 'Yape' && '📱'}
                                {metodo.nombre.includes('Tarjeta') && '💳'}
                                {metodo.nombre === 'Plin' && '💰'}
                                {metodo.nombre === 'Efectivo' && '💵'}
                                {metodo.nombre.includes('Transferencia') && '🏦'}
                                {' '}{metodo.nombre}
                            </button>
                        ))}
                    </div>

                    {/* Formulario según método */}
                    {metodoActual?.nombre.includes('Tarjeta') && (
                        <div className="payment-form">
                            <h4>Datos de la Tarjeta (Simulación)</h4>
                            <input
                                type="text"
                                placeholder="Número de tarjeta (16 dígitos)"
                                value={tarjeta.numero}
                                onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                maxLength="16"
                            />
                            <input
                                type="text"
                                placeholder="Nombre del titular"
                                value={tarjeta.nombre}
                                onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value.toUpperCase() })}
                            />
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    value={tarjeta.expiracion}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                        setTarjeta({ ...tarjeta, expiracion: val });
                                    }}
                                    maxLength="5"
                                />
                                <input
                                    type="text"
                                    placeholder="CVV"
                                    value={tarjeta.cvv}
                                    onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                    maxLength="3"
                                />
                            </div>
                        </div>
                    )}

                    {metodoActual?.nombre === 'Yape' && (
                        <div className="payment-form">
                            <h4>Pago con Yape (Simulación)</h4>
                            <input
                                type="text"
                                placeholder="Número de celular (9 dígitos)"
                                value={yape.telefono}
                                onChange={(e) => setYape({ ...yape, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                maxLength="9"
                            />
                            <input
                                type="text"
                                placeholder="Código de confirmación (6 dígitos)"
                                value={yape.codigo}
                                onChange={(e) => setYape({ ...yape, codigo: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                maxLength="6"
                            />
                            <p className="payment-help">
                                💡 En la app de Yape, envía S/ {subtotalTickets.toFixed(2)} al número 987654321 
                                y usa el código de confirmación que aparece.
                            </p>
                        </div>
                    )}

                    {(metodoActual?.nombre === 'Plin' || metodoActual?.nombre === 'Efectivo' || 
                      metodoActual?.nombre.includes('Transferencia')) && (
                        <div className="payment-form">
                            <h4>{metodoActual.nombre}</h4>
                            <p className="payment-help">
                                ℹ️ Este método de pago estará disponible próximamente.
                                Por ahora, utiliza Tarjeta o Yape para completar tu compra.
                            </p>
                        </div>
                    )}

                    <div className="action-buttons">
                        <button className="back-btn" onClick={handleBack} disabled={procesando}>
                            ← Volver
                        </button>
                        <button 
                            className="pay-btn" 
                            onClick={handlePagar}
                            disabled={procesando || (metodoActual && 
                                !metodoActual.nombre.includes('Tarjeta') && 
                                metodoActual.nombre !== 'Yape')}
                        >
                            {procesando ? '⏳ Procesando...' : `💳 Pagar S/ ${subtotalTickets.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payment;
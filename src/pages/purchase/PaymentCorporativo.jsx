import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    crearBoletaCorporativa, 
    createFuncion, 
    createAlquilerSala, 
    createPublicidad,
    deletePublicidad,
    crearValeCorporativo 
} from '../../services/api';
import BoletaCorporativa from '../../components/comp/BoletaCorporativa';
import './css/PaymentCorporativo.css';

function PaymentCorporativo() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { 
        tipoServicio, // 'funcion_privada' | 'alquiler_sala' | 'publicidad' | 'vales_corporativos'
        datosServicio, 
        precioTotal,
        detalles // { sala, sede, fecha, horario, pelicula, etc }
    } = location.state || {};

    const [procesando, setProcesando] = useState(false);
    const [boletaGenerada, setBoletaGenerada] = useState(null);
    const [error, setError] = useState('');
    const [publicidadCreada, setPublicidadCreada] = useState(null); // Guardar ID de publicidad creada

    // Formulario Tarjeta (único método de pago permitido)
    const [tarjeta, setTarjeta] = useState({
        numero: '',
        nombre: '',
        expiracion: '',
        cvv: ''
    });

    useEffect(() => {
        // Validar que tengamos los datos necesarios
        if (!tipoServicio || !datosServicio || !precioTotal) {
            alert('Datos incompletos. Regresando...');
            navigate('/corporate');
            return;
        }

        // Advertencia al salir de la página
        const handleBeforeUnload = (e) => {
            if (!procesando) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro de salir? Perderás los datos de tu reserva.';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [tipoServicio, datosServicio, precioTotal, procesando, navigate]);

    const handleTarjetaChange = (e) => {
        const { name, value } = e.target;
        
        let formattedValue = value;
        
        // Formatear según el campo
        if (name === 'numero') {
            // Solo números, máximo 16 dígitos
            formattedValue = value.replace(/\D/g, '').slice(0, 16);
        } else if (name === 'expiracion') {
            // Formato MM/AA
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
            }
        } else if (name === 'cvv') {
            // Solo números, máximo 3 dígitos
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        } else if (name === 'nombre') {
            // Solo letras y espacios
            formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        }
        
        setTarjeta(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validarFormulario = () => {
        if (!tarjeta.numero || tarjeta.numero.length < 16) {
            setError('❌ Número de tarjeta inválido (debe tener 16 dígitos)');
            return false;
        }
        
        if (!tarjeta.nombre.trim()) {
            setError('❌ Ingresa el nombre del titular de la tarjeta');
            return false;
        }
        
        if (!tarjeta.expiracion || tarjeta.expiracion.length < 5) {
            setError('❌ Fecha de expiración inválida (formato MM/AA)');
            return false;
        }
        
        // Validar que no esté expirada
        const [mes, anio] = tarjeta.expiracion.split('/');
        const fechaExpiracion = new Date(2000 + parseInt(anio), parseInt(mes) - 1);
        if (fechaExpiracion < new Date()) {
            setError('❌ La tarjeta está expirada');
            return false;
        }
        
        if (!tarjeta.cvv || tarjeta.cvv.length !== 3) {
            setError('❌ CVV inválido (debe tener 3 dígitos)');
            return false;
        }
        
        return true;
    };

    const handleCancelar = async () => {
        // Si hay una publicidad creada pero no se completó el pago, eliminarla
        if (publicidadCreada && tipoServicio === 'publicidad') {
            try {
                console.log('🗑️ Eliminando publicidad no pagada:', publicidadCreada);
                await deletePublicidad(publicidadCreada);
                console.log('✅ Publicidad eliminada correctamente');
            } catch (error) {
                console.error('❌ Error al eliminar publicidad:', error);
                // No mostrar error al usuario, solo registrarlo
            }
        }
        navigate('/corporate');
    };

    const procesarPago = async () => {
        setError('');
        
        if (!validarFormulario()) {
            return;
        }

        setProcesando(true);

        try {
            // 1. Simular procesamiento de pago con tarjeta (en producción sería integración real)
            await new Promise(resolve => setTimeout(resolve, 2000));

            let idPago = null;
            let servicioCreado;
            
            // 2. Para vales corporativos, crear primero el pago directamente
            if (tipoServicio === 'vales_corporativos') {
                console.log('💰 Creando pago para vales corporativos...');
                
                // Crear el pago directamente (sin orden previa)
                const pagoData = {
                    monto_total: precioTotal,
                    estado_pago: 'completado',
                    id_metodo_pago: 1 // Tarjeta por defecto
                };
                
                try {
                    const pagoResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/pagos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(pagoData)
                    });
                    
                    if (!pagoResponse.ok) {
                        const errorData = await pagoResponse.json();
                        throw new Error(errorData.error || 'Error al crear pago');
                    }
                    
                    const pago = await pagoResponse.json();
                    idPago = pago.id;
                    console.log('✅ Pago creado:', idPago);
                } catch (error) {
                    console.error('❌ Error creando pago:', error);
                    throw new Error('Error al procesar el pago: ' + error.message);
                }
                
                // Crear UN SOLO vale con la cantidad de usos especificada
                const codigoVale = generateValeCode(datosServicio.tipo);
                const valeResponse = await crearValeCorporativo({
                    codigo: codigoVale,
                    tipo: datosServicio.tipo,
                    valor: 20.00, // Siempre 20% de descuento
                    fecha_expiracion: calcularFechaExpiracion(),
                    cantidad_usos: datosServicio.cantidad, // Total de usos solicitados
                    id_pago: idPago // Asociar el vale al pago
                });
                
                const vale = valeResponse.vale || valeResponse;
                
                console.log(`✅ Vale creado con ${datosServicio.cantidad} usos disponibles`);
                console.log(`   Código: ${vale.codigo}`);
                
                servicioCreado = { 
                    id: idPago, // Usamos el ID del pago como referencia
                    vale: vale,
                    vales: [vale] // Para compatibilidad con el código existente
                };
            } else {
                // 2. Crear otros servicios (función privada, alquiler, publicidad)
                if (tipoServicio === 'funcion_privada') {
                    servicioCreado = await createFuncion(datosServicio);
                } else if (tipoServicio === 'alquiler_sala') {
                    servicioCreado = await createAlquilerSala(datosServicio);
                } else if (tipoServicio === 'publicidad') {
                    servicioCreado = await createPublicidad(datosServicio);
                    // Guardar el ID de la publicidad creada para poder eliminarla si se cancela
                    const idPublicidad = servicioCreado.id || servicioCreado.publicidad?.id;
                    setPublicidadCreada(idPublicidad);
                }
            }

            // 3. Generar boleta corporativa con QR
            let idReferencia;
            
            // Obtener el ID de referencia según el tipo de servicio
            if (tipoServicio === 'vales_corporativos') {
                idReferencia = idPago; // El id de referencia es el id del pago
            } else if (tipoServicio === 'funcion_privada') {
                idReferencia = servicioCreado.id || servicioCreado.funcion?.id;
            } else if (tipoServicio === 'alquiler_sala') {
                idReferencia = servicioCreado.id || servicioCreado.alquiler?.id;
            } else if (tipoServicio === 'publicidad') {
                idReferencia = servicioCreado.id || servicioCreado.publicidad?.id;
            }

            console.log('📝 Creando boleta con:', { 
                tipoServicio, 
                idReferencia, 
                servicioCreado: JSON.stringify(servicioCreado, null, 2) 
            });

            if (!idReferencia) {
                console.error('❌ servicioCreado completo:', servicioCreado);
                throw new Error(`No se pudo obtener el ID de referencia del servicio creado. Tipo: ${tipoServicio}`);
            }

            const boleta = await crearBoletaCorporativa(tipoServicio, idReferencia);

            // 4. Preparar datos para mostrar la boleta
            setBoletaGenerada({
                ...boleta,
                tipo_servicio: obtenerNombreTipoServicio(tipoServicio),
                ...detalles,
                precio: precioTotal,
                vales: servicioCreado.vales || null // Para mostrar los códigos de vales generados
            });

        } catch (err) {
            console.error('Error procesando pago:', err);
            setError(
                err.response?.data?.mensaje || 
                err.response?.data?.error || 
                'Error al procesar el pago. Por favor, intenta nuevamente.'
            );
            setProcesando(false);
        }
    };

    const generateValeCode = (tipo) => {
        const prefix = tipo === 'entrada' ? 'ENT' : 'CMB';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        return `${prefix}-${random}-${timestamp}`;
    };

    const calcularFechaExpiracion = () => {
        const fecha = new Date();
        fecha.setFullYear(fecha.getFullYear() + 1); // Válido por 1 año
        return fecha.toISOString().split('T')[0];
    };

    const obtenerNombreTipoServicio = (tipo) => {
        const nombres = {
            'funcion_privada': 'Función Privada',
            'alquiler_sala': 'Alquiler de Sala',
            'publicidad': 'Publicidad',
            'vales_corporativos': 'Vales Corporativos'
        };
        return nombres[tipo] || 'Servicio Corporativo';
    };

    const handleCerrarBoleta = () => {
        setBoletaGenerada(null);
        navigate('/corporate', { 
            state: { 
                success: '✅ ¡Reserva exitosa! Tu boleta ha sido generada.' 
            } 
        });
    };

    if (!tipoServicio || !datosServicio) {
        return null;
    }

    return (
        <div className="payment-container">
            <div className="payment-wrapper">
                <div className="payment-header">
                    <h1>💳 Pago de Servicio Corporativo</h1>
                    <p className="payment-subtitle">
                        {obtenerNombreTipoServicio(tipoServicio)}
                    </p>
                </div>

                <div className="payment-content">
                    {/* Resumen del servicio */}
                    <div className="payment-summary">
                        <h2>📋 Resumen de Reserva</h2>
                        
                        <div className="summary-details">
                            {/* Función Privada y Alquiler de Sala */}
                            {(tipoServicio === 'funcion_privada' || tipoServicio === 'alquiler_sala') && (
                                <>
                                    <div className="summary-item">
                                        <span className="summary-label">🏢 Sede:</span>
                                        <span className="summary-value">{detalles?.sede}</span>
                                    </div>
                                    
                                    <div className="summary-item">
                                        <span className="summary-label">🎬 Sala:</span>
                                        <span className="summary-value">{detalles?.sala}</span>
                                    </div>
                                    
                                    <div className="summary-item">
                                        <span className="summary-label">📅 Fecha:</span>
                                        <span className="summary-value">{detalles?.fecha}</span>
                                    </div>
                                    
                                    <div className="summary-item">
                                        <span className="summary-label">🕐 Horario:</span>
                                        <span className="summary-value">{detalles?.horario}</span>
                                    </div>
                                    
                                    {detalles?.pelicula && (
                                        <div className="summary-item">
                                            <span className="summary-label">🎥 Película:</span>
                                            <span className="summary-value">{detalles.pelicula}</span>
                                        </div>
                                    )}
                                    
                                    {tipoServicio === 'funcion_privada' && (
                                        <div className="summary-item highlight">
                                            <span className="summary-label">⏱️ Duración:</span>
                                            <span className="summary-value">3 horas (Uso completo de la sala)</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Publicidad */}
                            {tipoServicio === 'publicidad' && (
                                <>
                                    <div className="summary-item">
                                        <span className="summary-label">📺 Tipo:</span>
                                        <span className="summary-value">{detalles?.tipo_publicidad?.toUpperCase()}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">🏢 Sede:</span>
                                        <span className="summary-value">{detalles?.sede}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">📅 Inicio:</span>
                                        <span className="summary-value">{detalles?.fecha_inicio}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">📅 Fin:</span>
                                        <span className="summary-value">{detalles?.fecha_fin}</span>
                                    </div>
                                    <div className="summary-item highlight">
                                        <span className="summary-label">⏱️ Duración:</span>
                                        <span className="summary-value">{detalles?.duracion_dias} días</span>
                                    </div>
                                </>
                            )}

                            {/* Vales Corporativos */}
                            {tipoServicio === 'vales_corporativos' && (
                                <>
                                    <div className="summary-item">
                                        <span className="summary-label">🎫 Tipo de Vale:</span>
                                        <span className="summary-value">
                                            {detalles?.tipo_vale === 'entrada' ? '🎬 Entrada' : '🍿 Combo'}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">📦 Cantidad:</span>
                                        <span className="summary-value">{detalles?.cantidad} vales</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">💵 Valor Unitario:</span>
                                        <span className="summary-value">S/ {detalles?.valor_unitario?.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item highlight">
                                        <span className="summary-label">⏰ Validez:</span>
                                        <span className="summary-value">1 año desde la emisión</span>
                                    </div>
                                </>
                            )}
                            
                            {detalles?.descripcion && (
                                <div className="summary-item">
                                    <span className="summary-label">📝 Descripción:</span>
                                    <span className="summary-value">{detalles.descripcion}</span>
                                </div>
                            )}
                        </div>

                        <div className="summary-total">
                            <span>Total a Pagar:</span>
                            <span className="total-amount">S/ {precioTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Formulario de pago */}
                    <div className="payment-form-section">
                        <h2>💳 Información de Tarjeta</h2>
                        <p className="payment-info">
                            ⚠️ Solo se aceptan pagos con tarjeta de crédito o débito para servicios corporativos
                        </p>

                        {error && (
                            <div className="payment-error">
                                {error}
                            </div>
                        )}

                        <div className="payment-form">
                            <div className="form-group">
                                <label>Número de Tarjeta</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={tarjeta.numero}
                                    onChange={handleTarjetaChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="16"
                                    disabled={procesando}
                                />
                                <small>{tarjeta.numero.length}/16 dígitos</small>
                            </div>

                            <div className="form-group">
                                <label>Nombre del Titular</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={tarjeta.nombre}
                                    onChange={handleTarjetaChange}
                                    placeholder="JUAN PEREZ"
                                    disabled={procesando}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Expiración</label>
                                    <input
                                        type="text"
                                        name="expiracion"
                                        value={tarjeta.expiracion}
                                        onChange={handleTarjetaChange}
                                        placeholder="MM/AA"
                                        maxLength="5"
                                        disabled={procesando}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={tarjeta.cvv}
                                        onChange={handleTarjetaChange}
                                        placeholder="123"
                                        maxLength="3"
                                        disabled={procesando}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="payment-actions">
                            <button
                                className="btn-cancelar"
                                onClick={handleCancelar}
                                disabled={procesando}
                            >
                                ← Cancelar
                            </button>

                            <button
                                className="btn-pagar"
                                onClick={procesarPago}
                                disabled={procesando}
                            >
                                {procesando ? (
                                    <>
                                        <span className="spinner"></span>
                                        Procesando Pago...
                                    </>
                                ) : (
                                    <>
                                        💳 Pagar S/ {precioTotal.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="payment-security">
                            <p>🔒 <strong>Pago seguro</strong> - Tus datos están protegidos</p>
                            <p>📱 Recibirás tu boleta con código QR inmediatamente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Boleta */}
            {boletaGenerada && (
                <BoletaCorporativa
                    boleta={boletaGenerada}
                    onCerrar={handleCerrarBoleta}
                />
            )}
        </div>
    );
}

export default PaymentCorporativo;

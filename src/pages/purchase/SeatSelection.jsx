import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAsientosPorFuncion, bloquearAsiento, liberarAsiento, getSalaById } from '../../services/api';
import { usePurchase } from '../../context/PurchaseContext';
import { useAuth } from '../../context/AuthContext';
import TimerExpiredModal from '../../components/general/TimerExpiredModal';
import './css/SeatSelection.css';

function SeatSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        timeRemaining, 
        timerActive, 
        startTimer, 
        extendTimer,
        setTimerExpireCallback,
        formatTime, 
        setHasActiveSelection 
    } = usePurchase();
    const { user } = useAuth();
    
    const { funcion, pelicula, selectedSeats: prevSelectedSeats, misAsientos: prevMisAsientos } = location.state || {};
    
    const [sala, setSala] = useState(null);
    const [asientos, setAsientos] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState(prevSelectedSeats || []);
    const [misAsientos, setMisAsientos] = useState(prevMisAsientos || []); // IDs de asientos que yo bloqueé
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [showTimerModal, setShowTimerModal] = useState(false);
    
    const intervaloActualizacionRef = useRef(null);

    useEffect(() => {
        if (!funcion || !pelicula) {
            alert('No se pudo cargar la información de la función');
            navigate('/movies');
            return;
        }
        
        // Configurar callback cuando expire el timer
        setTimerExpireCallback(() => {
            setShowTimerModal(true);
        });
        
        const inicializar = async () => {
            await cargarDatos();
            
            // Verificar asientos previos DESPUÉS de cargar datos
            if (prevSelectedSeats && prevSelectedSeats.length > 0) {
                await verificarAsientosPrevios();
            }
        };
        
        inicializar();
        
        // Iniciar temporizador global solo si no está activo
        if (!timerActive) {
            startTimer();
        }
        
        // Actualización automática de asientos cada 3 segundos
        intervaloActualizacionRef.current = setInterval(() => {
            cargarAsientosSilenciosamente();
        }, 3000);
        
        // Prevenir navegación accidental
        const handleBeforeUnload = (e) => {
            if (selectedSeats.length > 0 && !isNavigating) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro? Perderás tus asientos seleccionados.';
                return e.returnValue;
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (intervaloActualizacionRef.current) {
                clearInterval(intervaloActualizacionRef.current);
            }
            // Liberar asientos al desmontar SOLO si:
            // 1. No se está navegando hacia adelante (isNavigating)
            // 2. No hay asientos previos (NO es un regreso desde otra página)
            const esRegreso = prevSelectedSeats && prevSelectedSeats.length > 0;
            if (selectedSeats.length > 0 && !isNavigating && !esRegreso) {
                console.log('🧹 Cleanup: Liberando asientos al desmontar (navegación no prevista)');
                liberarTodosAsientosSinRecargar();
            } else if (esRegreso) {
                console.log('✅ Cleanup: NO liberando asientos (es un regreso desde otra página)');
            } else if (isNavigating) {
                console.log('➡️ Cleanup: NO liberando asientos (navegación controlada)');
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Monitorear cuando el timer llega a 0
    useEffect(() => {
        if (timeRemaining === 0 && timerActive) {
            liberarTodosAsientos();
            alert('⏰ El tiempo de selección ha expirado. Los asientos han sido liberados.');
            navigate('/movies');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining, timerActive]);

    // Actualizar flag de selección activa
    useEffect(() => {
        setHasActiveSelection(selectedSeats.length > 0);
    }, [selectedSeats, setHasActiveSelection]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Cargar sala
            const salaData = await getSalaById(funcion.id_sala);
            if (!salaData) {
                setError('No se pudo cargar la información de la sala');
                setLoading(false);
                return;
            }
            setSala(salaData);

            // Cargar asientos ocupados/bloqueados
            const asientosData = await getAsientosPorFuncion(funcion.id);
            setAsientos(asientosData || []);
            
            setLoading(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los asientos. Por favor, intenta nuevamente.');
            setLoading(false);
        }
    };

    // Actualización silenciosa sin mostrar loading (para tiempo real)
    const cargarAsientosSilenciosamente = async () => {
        try {
            const asientosData = await getAsientosPorFuncion(funcion.id);
            setAsientos(asientosData || []);
        } catch (error) {
            console.error('Error en actualización automática:', error);
            // No mostramos error al usuario para no interrumpir su experiencia
        }
    };

    // Verificar que los asientos previos aún estén bloqueados por nosotros
    const verificarAsientosPrevios = async () => {
        try {
            if (!user || !user.id) {
                console.warn('Usuario no disponible para verificación');
                setSelectedSeats([]);
                setMisAsientos([]);
                return;
            }

            const asientosActuales = await getAsientosPorFuncion(funcion.id);
            const asientosValidos = [];
            const idsValidos = [];

            console.log('🔍 Verificando asientos previos:', {
                prevSelectedSeats,
                userId: user.id,
                totalAsientosActuales: asientosActuales.length
            });

            for (const asiento of prevSelectedSeats) {
                const asientoActual = asientosActuales.find(
                    a => a.fila === asiento.fila && a.numero === asiento.numero
                );
                
                console.log(`Verificando ${asiento.fila}${asiento.numero}:`, {
                    encontrado: !!asientoActual,
                    estado: asientoActual?.estado,
                    id_usuario_bloqueo: asientoActual?.id_usuario_bloqueo,
                    userId: user.id
                });
                
                // CASO 1: Asiento bloqueado por este usuario - extender
                if (asientoActual && 
                    asientoActual.estado === 'bloqueado' &&
                    asientoActual.id_usuario_bloqueo === user.id) {
                    
                    try {
                        await bloquearAsiento({
                            id_funcion: funcion.id,
                            fila: asiento.fila,
                            numero: asiento.numero
                        });
                        console.log(`✅ Bloqueo extendido: ${asiento.fila}${asiento.numero}`);
                        
                        asientosValidos.push({
                            fila: asiento.fila,
                            numero: asiento.numero,
                            id: asiento.id
                        });
                        idsValidos.push(asiento.id);
                    } catch (error) {
                        console.error(`❌ Error extendiendo ${asiento.fila}${asiento.numero}:`, error);
                    }
                }
                // CASO 2: Asiento no existe o está libre - intentar bloquear de nuevo
                else if (!asientoActual || asientoActual.estado === 'libre') {
                    console.log(`🔄 Asiento ${asiento.fila}${asiento.numero} liberado/expirado - intentando re-bloquear...`);
                    
                    try {
                        await bloquearAsiento({
                            id_funcion: funcion.id,
                            fila: asiento.fila,
                            numero: asiento.numero
                        });
                        console.log(`✅ Asiento ${asiento.fila}${asiento.numero} re-bloqueado exitosamente`);
                        
                        asientosValidos.push({
                            fila: asiento.fila,
                            numero: asiento.numero,
                            id: asiento.id
                        });
                        idsValidos.push(asiento.id);
                    } catch (error) {
                        console.warn(`⚠️ No se pudo re-bloquear ${asiento.fila}${asiento.numero}:`, error.response?.data?.error || error.message);
                    }
                }
                // CASO 3: Asiento ocupado o bloqueado por otro - no se puede recuperar
                else if (asientoActual.estado === 'ocupado') {
                    console.warn(`⚠️ Asiento ${asiento.fila}${asiento.numero} ya fue vendido`);
                } else if (asientoActual.id_usuario_bloqueo !== user.id) {
                    console.warn(`⚠️ Asiento ${asiento.fila}${asiento.numero} bloqueado por otro usuario`);
                }
            }

            console.log('✅ Resultado final:', { 
                asientosValidos, 
                idsValidos,
                perdidos: prevSelectedSeats.length - asientosValidos.length 
            });

            // Actualizar estados
            setSelectedSeats(asientosValidos);
            setMisAsientos(idsValidos);

            // Notificar si se perdieron asientos
            const perdidos = prevSelectedSeats.length - asientosValidos.length;
            if (perdidos > 0) {
                alert(`⚠️ ${perdidos} asiento(s) ya no están disponibles (fueron tomados por otro usuario). Asientos recuperados: ${asientosValidos.length}`);
            } else if (asientosValidos.length > 0) {
                console.log(`✅ Todos los ${asientosValidos.length} asientos fueron restaurados correctamente`);
            }
            
        } catch (error) {
            console.error('❌ Error verificando asientos previos:', error);
            setSelectedSeats([]);
            setMisAsientos([]);
        }
    };

    const generarMatrizAsientos = () => {
        if (!sala) return [];
        
        const matriz = [];
        const filas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, sala.filas);
        
        for (let i = 0; i < sala.filas; i++) {
            const fila = [];
            for (let j = 1; j <= sala.columnas; j++) {
                const fila_letra = filas[i];
                const asientoOcupado = asientos.find(
                    a => a.fila === fila_letra && a.numero === j
                );
                
                fila.push({
                    fila: fila_letra,
                    numero: j,
                    estado: asientoOcupado ? asientoOcupado.estado : 'libre',
                    id: `${fila_letra}${j}`,
                    id_usuario_bloqueo: asientoOcupado?.id_usuario_bloqueo || null
                });
            }
            matriz.push(fila);
        }
        return matriz;
    };

    const toggleSeat = async (asiento) => {
        if (asiento.estado === 'ocupado') {
            alert('Este asiento ya está ocupado');
            return;
        }
        
        const seatId = asiento.id;
        const esMioEnEstado = misAsientos.includes(seatId);
        
        console.log('🎯 Toggle asiento:', {
            seatId,
            fila: asiento.fila,
            numero: asiento.numero,
            estado: asiento.estado,
            id_usuario_bloqueo: asiento.id_usuario_bloqueo,
            userId: user?.id,
            esMioEnEstado,
            selectedSeatsCount: selectedSeats.length,
            misAsientosCount: misAsientos.length
        });
        
        // CASO 1: Es mío (está en misAsientos) - LIBERAR
        if (esMioEnEstado) {
            try {
                console.log(`🔓 Intentando liberar ${asiento.fila}${asiento.numero}...`);
                
                const response = await liberarAsiento({
                    id_funcion: funcion.id,
                    fila: asiento.fila,
                    numero: asiento.numero
                });
                
                console.log(`✅ Respuesta liberación:`, response);
                
                // Actualizar estados locales
                setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
                setMisAsientos(prev => prev.filter(id => id !== seatId));
                
                // Recargar asientos para sincronizar
                await cargarAsientosSilenciosamente();
                
                console.log(`✅ Asiento ${seatId} liberado exitosamente`);
            } catch (error) {
                console.error(`❌ Error liberando ${seatId}:`, error);
                alert(`Error al liberar el asiento: ${error.response?.data?.error || error.message}`);
                // Forzar recarga para sincronizar
                await cargarAsientosSilenciosamente();
            }
            return;
        }

        // CASO 2: Está bloqueado - verificar de quién es
        if (asiento.estado === 'bloqueado') {
            console.log(`🔒 Asiento bloqueado - Verificando propiedad...`);
            
            // Obtener estado real del backend
            const asientosActuales = await getAsientosPorFuncion(funcion.id);
            const asientoActual = asientosActuales.find(
                a => a.fila === asiento.fila && a.numero === asiento.numero
            );
            
            if (!asientoActual) {
                console.log(`ℹ️ Asiento ${seatId} ya no existe en backend (fue liberado)`);
                await cargarAsientosSilenciosamente();
                return;
            }
            
            console.log(`📊 Estado real del asiento:`, {
                estado: asientoActual.estado,
                id_usuario_bloqueo: asientoActual.id_usuario_bloqueo,
                userId: user?.id,
                esMio: asientoActual.id_usuario_bloqueo === user?.id
            });
            
            // Es mío pero no está en misAsientos - SINCRONIZAR
            if (asientoActual.id_usuario_bloqueo === user?.id) {
                console.log(`✅ Es mío, sincronizando estado local...`);
                const nuevoAsiento = {
                    fila: asiento.fila,
                    numero: asiento.numero,
                    id: seatId
                };
                setSelectedSeats(prev => [...prev, nuevoAsiento]);
                setMisAsientos(prev => [...prev, seatId]);
                return;
            }
            
            // Es de otro usuario
            alert('Este asiento está bloqueado por otro usuario');
            return;
        }

        // CASO 3: Está libre - BLOQUEAR
        try {
            console.log(`🔒 Bloqueando asiento libre ${asiento.fila}${asiento.numero}...`);
            
            const response = await bloquearAsiento({
                id_funcion: funcion.id,
                fila: asiento.fila,
                numero: asiento.numero
            });
            
            console.log(`✅ Respuesta bloqueo:`, response);
            
            // Actualizar estados locales
            const nuevoAsiento = {
                fila: asiento.fila,
                numero: asiento.numero,
                id: seatId
            };
            
            setSelectedSeats(prev => [...prev, nuevoAsiento]);
            setMisAsientos(prev => [...prev, seatId]);
            
            // Recargar asientos para sincronizar
            await cargarAsientosSilenciosamente();
            
            console.log(`✅ Asiento ${seatId} bloqueado exitosamente`);
        } catch (error) {
            console.error(`❌ Error bloqueando ${seatId}:`, error);
            
            if (error.response?.status === 409) {
                alert('Este asiento acaba de ser reservado por otro usuario');
            } else {
                alert(`Error al bloquear el asiento: ${error.response?.data?.error || error.message}`);
            }
            
            // Forzar recarga para sincronizar
            await cargarAsientosSilenciosamente();
        }
    };

    const liberarTodosAsientos = async () => {
        for (const asiento of selectedSeats) {
            try {
                await liberarAsiento({
                    id_funcion: funcion.id,
                    fila: asiento.fila,
                    numero: asiento.numero
                });
            } catch (error) {
                console.error('Error liberando asiento:', error);
            }
        }
        setSelectedSeats([]);
        setMisAsientos([]);
        await cargarDatos();
    };

    const liberarTodosAsientosSinRecargar = async () => {
        for (const asiento of selectedSeats) {
            try {
                await liberarAsiento({
                    id_funcion: funcion.id,
                    fila: asiento.fila,
                    numero: asiento.numero
                });
            } catch (error) {
                console.error('Error liberando asiento:', error);
            }
        }
    };

    const handleContinue = () => {
        if (selectedSeats.length === 0) {
            alert('Debes seleccionar al menos un asiento');
            return;
        }

        // Permitir navegación
        setIsNavigating(true);
        navigate('/ticket-type', { 
            state: { 
                selectedSeats, 
                funcion, 
                pelicula,
                timeRemaining,
                misAsientos
            } 
        });
    };

    const handleCancel = async () => {
        const confirmCancel = window.confirm(
            '⚠️ Si sales ahora, perderás tus asientos seleccionados y se cancelará tu compra. ¿Deseas continuar?'
        );
        if (!confirmCancel) return;
        
        setIsNavigating(true);
        await liberarTodosAsientos();
        navigate('/movies');
    };

    // Handlers del modal de tiempo expirado
    const handleExtendTime = () => {
        setShowTimerModal(false);
        extendTimer(); // Reinicia a 5 minutos
        alert('✅ Tiempo extendido por 5 minutos más');
    };

    const handleExitFromTimer = async () => {
        setShowTimerModal(false);
        setIsNavigating(true);
        await liberarTodosAsientos();
        alert('⏰ Tu tiempo de compra ha expirado. Vuelve a seleccionar tus asientos.');
        
        // Verificar que pelicula existe antes de navegar
        if (pelicula && pelicula.id) {
            navigate(`/movie/${pelicula.id}`, { 
                state: { pelicula },
                replace: true 
            });
        } else if (funcion && funcion.id_pelicula) {
            // Si no hay pelicula completa pero hay id en función
            navigate(`/movie/${funcion.id_pelicula}`, { replace: true });
        } else {
            // Fallback: ir a películas
            console.warn('⚠️ No hay información de película, redirigiendo a /movies');
            navigate('/movies', { replace: true });
        }
    };

    if (loading) {
        return <div className="seat-selection"><p>Cargando asientos...</p></div>;
    }

    if (error) {
        return <div className="seat-selection"><p className="error">{error}</p></div>;
    }

    const matrizAsientos = generarMatrizAsientos();

    return (
        <div className="seat-selection">
            <div className="seat-header">
                <h2>Selecciona tus asientos</h2>
                <p className="movie-info">
                    {pelicula.titulo} - {funcion.fecha} {funcion.hora} - Sala: {sala?.nombre}
                </p>
                <div className="timer">
                    <span className="timer-icon">⏰</span>
                    Tiempo restante: <strong>{formatTime(timeRemaining)}</strong>
                </div>
            </div>

            <div className="screen">PANTALLA</div>

            <div className="seats-container">
                {matrizAsientos.map((fila, i) => (
                    <div key={i} className="seat-row">
                        <span className="row-label">{fila[0].fila}</span>
                        {fila.map((asiento) => {
                            const esMioAsiento = misAsientos.includes(asiento.id);
                            return (
                                <button
                                    key={asiento.id}
                                    className={`seat ${asiento.estado} ${esMioAsiento ? 'mi-seleccion' : ''}`}
                                    onClick={() => toggleSeat(asiento)}
                                    disabled={asiento.estado === 'ocupado' || (asiento.estado === 'bloqueado' && !esMioAsiento)}
                                    title={`${asiento.id} - ${esMioAsiento ? 'Tu selección' : asiento.estado}`}
                                >
                                    <span className="seat-label">{asiento.id}</span>
                                </button>
                            );
                        })}
                        <span className="row-label">{fila[0].fila}</span>
                    </div>
                ))}
            </div>

            <div className="legend">
                <div className="legend-item">
                    <div className="seat libre mini"></div>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <div className="seat mi-seleccion mini"></div>
                    <span>Tu selección</span>
                </div>
                <div className="legend-item">
                    <div className="seat bloqueado mini"></div>
                    <span>Bloqueado por otro</span>
                </div>
                <div className="legend-item">
                    <div className="seat ocupado mini"></div>
                    <span>Ocupado</span>
                </div>
            </div>

            <div className="selected-info">
                <p>Asientos seleccionados: <strong>{selectedSeats.map(s => s.id).join(', ') || 'Ninguno'}</strong></p>
                <p>Total: <strong>{selectedSeats.length} asiento(s)</strong></p>
            </div>

            <div className="action-buttons">
                <button className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                </button>
                <button 
                    className="continue-btn" 
                    onClick={handleContinue} 
                    disabled={selectedSeats.length === 0}
                >
                    Continuar con la compra →
                </button>
            </div>

            {/* Modal cuando el timer expire */}
            {showTimerModal && (
                <TimerExpiredModal 
                    onExtend={handleExtendTime}
                    onExit={handleExitFromTimer}
                />
            )}
        </div>
    );
}

export default SeatSelection;
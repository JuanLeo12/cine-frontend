import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAsientosPorFuncion, bloquearAsiento, liberarAsiento, getSalaById } from '../../services/api';
import { usePurchase } from '../../context/PurchaseContext';
import { useAuth } from '../../context/AuthContext';
import './css/SeatSelection.css';

function SeatSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { timeRemaining, timerActive, startTimer, formatTime, setHasActiveSelection } = usePurchase();
    const { user } = useAuth();
    
    const { funcion, pelicula, selectedSeats: prevSelectedSeats, misAsientos: prevMisAsientos } = location.state || {};
    
    const [sala, setSala] = useState(null);
    const [asientos, setAsientos] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState(prevSelectedSeats || []);
    const [misAsientos, setMisAsientos] = useState(prevMisAsientos || []); // IDs de asientos que yo bloqueé
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    
    const intervaloActualizacionRef = useRef(null);

    useEffect(() => {
        if (!funcion || !pelicula) {
            alert('No se pudo cargar la información de la función');
            navigate('/movies');
            return;
        }
        
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
            // Liberar asientos al desmontar si no se completó la compra
            if (selectedSeats.length > 0 && !isNavigating) {
                liberarTodosAsientosSinRecargar();
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
            const asientosActuales = await getAsientosPorFuncion(funcion.id);
            const asientosValidos = [];
            const idsValidos = [];

            for (const asiento of prevSelectedSeats) {
                const asientoActual = asientosActuales.find(
                    a => a.fila === asiento.fila && a.numero === asiento.numero
                );
                
                // ✅ Verificar que esté bloqueado Y que sea bloqueado por ESTE usuario
                if (
                    asientoActual && 
                    asientoActual.estado === 'bloqueado' &&
                    asientoActual.id_usuario_bloqueo === user.id
                ) {
                    asientosValidos.push(asiento);
                    idsValidos.push(asiento.id);
                }
            }

            // Actualizar solo con asientos que siguen bloqueados por nosotros
            if (asientosValidos.length !== prevSelectedSeats.length) {
                const perdidos = prevSelectedSeats.length - asientosValidos.length;
                alert(`⚠️ ${perdidos} asiento(s) ya no están disponibles. Asientos mantenidos: ${asientosValidos.length}`);
            }
            
            setSelectedSeats(asientosValidos);
            setMisAsientos(idsValidos);
        } catch (error) {
            console.error('Error verificando asientos previos:', error);
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
                    id: `${fila_letra}${j}`
                });
            }
            matriz.push(fila);
        }
        return matriz;
    };

    const toggleSeat = async (asiento) => {
        if (asiento.estado === 'ocupado') return;
        
        const seatId = asiento.id;
        
        // Si ya está en MIS asientos seleccionados, liberarlo
        if (misAsientos.includes(seatId)) {
            try {
                await liberarAsiento({
                    id_funcion: funcion.id,
                    fila: asiento.fila,
                    numero: asiento.numero
                });
                
                setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
                setMisAsientos(misAsientos.filter(id => id !== seatId));
                await cargarDatos(); // Refrescar estado de asientos
            } catch (error) {
                console.error('Error liberando asiento:', error);
                alert('Error al liberar el asiento');
            }
            return;
        }

        // Si está bloqueado por otro usuario
        if (asiento.estado === 'bloqueado') {
            alert('Este asiento está bloqueado por otro usuario');
            return;
        }

        // Bloquear asiento
        try {
            await bloquearAsiento({
                id_funcion: funcion.id,
                fila: asiento.fila,
                numero: asiento.numero
            });
            
            setSelectedSeats([...selectedSeats, asiento]);
            setMisAsientos([...misAsientos, seatId]);
            await cargarDatos(); // Refrescar estado de asientos
        } catch (error) {
            console.error('Error bloqueando asiento:', error);
            if (error.response?.status === 409) {
                alert('Este asiento acaba de ser reservado por otro usuario');
                await cargarDatos();
            } else {
                alert('Error al bloquear el asiento');
            }
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
        </div>
    );
}

export default SeatSelection;
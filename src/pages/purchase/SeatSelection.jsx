import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAsientosPorFuncion, bloquearAsiento, liberarAsiento, getSalaById } from '../../services/api';
import './css/SeatSelection.css';

function SeatSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { funcion, pelicula } = location.state || {};
    
    const [sala, setSala] = useState(null);
    const [asientos, setAsientos] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutos en segundos
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!funcion || !pelicula) {
            alert('No se pudo cargar la información de la función');
            navigate('/movies');
            return;
        }
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Temporizador de 5 minutos
    useEffect(() => {
        if (selectedSeats.length === 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Tiempo expirado - liberar asientos
                    liberarTodosAsientos();
                    alert('⏰ El tiempo de selección ha expirado. Los asientos han sido liberados.');
                    return 300;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSeats.length]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Cargar sala
            const salaData = await getSalaById(funcion.id_sala);
            setSala(salaData);

            // Cargar asientos ocupados/bloqueados
            const asientosData = await getAsientosPorFuncion(funcion.id);
            setAsientos(asientosData);
            
            setLoading(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los asientos');
            setLoading(false);
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
        
        // Si ya está seleccionado, liberarlo
        if (selectedSeats.some(s => s.id === seatId)) {
            try {
                await liberarAsiento({
                    id_funcion: funcion.id,
                    fila: asiento.fila,
                    numero: asiento.numero
                });
                
                setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
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
            setTimeRemaining(300); // Reiniciar temporizador
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
        await cargarDatos();
    };

    const handleContinue = () => {
        if (selectedSeats.length === 0) {
            alert('Debes seleccionar al menos un asiento');
            return;
        }

        navigate('/ticket-type', { 
            state: { 
                selectedSeats, 
                funcion, 
                pelicula,
                timeRemaining
            } 
        });
    };

    const handleCancel = async () => {
        if (selectedSeats.length > 0) {
            await liberarTodosAsientos();
        }
        navigate(-1);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                {selectedSeats.length > 0 && (
                    <div className="timer">
                        <span className="timer-icon">⏰</span>
                        Tiempo restante: <strong>{formatTime(timeRemaining)}</strong>
                    </div>
                )}
            </div>

            <div className="screen">PANTALLA</div>

            <div className="seats-container">
                {matrizAsientos.map((fila, i) => (
                    <div key={i} className="seat-row">
                        <span className="row-label">{fila[0].fila}</span>
                        {fila.map((asiento) => (
                            <button
                                key={asiento.id}
                                className={`seat ${asiento.estado} ${
                                    selectedSeats.some(s => s.id === asiento.id) ? 'selected' : ''
                                }`}
                                onClick={() => toggleSeat(asiento)}
                                disabled={asiento.estado === 'ocupado' || asiento.estado === 'bloqueado'}
                                title={`${asiento.id} - ${asiento.estado}`}
                            >
                                {asiento.numero}
                            </button>
                        ))}
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
                    <div className="seat selected mini"></div>
                    <span>Tu selección</span>
                </div>
                <div className="legend-item">
                    <div className="seat bloqueado mini"></div>
                    <span>Bloqueado</span>
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
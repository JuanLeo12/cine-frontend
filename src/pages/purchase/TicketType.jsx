import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTiposTicket } from '../../services/api';
import { usePurchase } from '../../context/PurchaseContext';
import './css/TicketType.css';

function TicketType() {
    const navigate = useNavigate();
    const location = useLocation();
    const { timeRemaining, formatTime } = usePurchase();
    
    const { selectedSeats, funcion, pelicula, misAsientos } = location.state || {};

    const [tiposTicket, setTiposTicket] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [loading, setLoading] = useState(true);
    const [subtotal, setSubtotal] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (!selectedSeats || !funcion || !pelicula) {
            alert('Datos incompletos. Regresando...');
            navigate('/movies');
            return;
        }
        
        console.log('TicketType - Estado recibido:', { selectedSeats, funcion, pelicula, misAsientos });
        
        cargarTiposTicket();

        // Prevenir navegación accidental
        const handleBeforeUnload = (e) => {
            if (!isNavigating) {
                e.preventDefault();
                e.returnValue = '¿Estás seguro? Perderás tu selección.';
                return e.returnValue;
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        calcularSubtotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cantidades]);

    const cargarTiposTicket = async () => {
        try {
            const tipos = await getTiposTicket();
            console.log('Tipos de ticket cargados:', tipos);
            setTiposTicket(tipos);
            
            // Inicializar cantidades en 0
            const inicial = {};
            tipos.forEach(tipo => {
                inicial[tipo.id] = 0;
            });
            setCantidades(inicial);
            
            setLoading(false);
        } catch (error) {
            console.error('Error cargando tipos de ticket:', error);
            alert('Error al cargar tipos de ticket');
            setLoading(false);
        }
    };

    const calcularSubtotal = () => {
        let total = 0;
        tiposTicket.forEach(tipo => {
            const cantidad = cantidades[tipo.id] || 0;
            total += cantidad * parseFloat(tipo.precio_base);
        });
        setSubtotal(total);
    };

    const handleCantidadChange = (tipoId, valor) => {
        const totalActual = Object.values(cantidades).reduce((sum, cant) => sum + cant, 0);
        const nuevoValor = Math.max(0, parseInt(valor) || 0);
        
        // Verificar que no exceda el número de asientos seleccionados
        const diferencia = nuevoValor - (cantidades[tipoId] || 0);
        if (totalActual + diferencia > selectedSeats.length) {
            alert(`Solo puedes seleccionar ${selectedSeats.length} ticket(s) para los asientos reservados`);
            return;
        }

        setCantidades({
            ...cantidades,
            [tipoId]: nuevoValor
        });
    };

    const handleContinue = () => {
        const totalTickets = Object.values(cantidades).reduce((sum, cant) => sum + cant, 0);
        
        if (totalTickets === 0) {
            alert('Debes seleccionar al menos un tipo de ticket');
            return;
        }

        if (totalTickets !== selectedSeats.length) {
            alert(`Debes seleccionar exactamente ${selectedSeats.length} ticket(s) para los asientos reservados`);
            return;
        }

        // Preparar array de tickets para la orden
        const tickets = tiposTicket
            .filter(tipo => cantidades[tipo.id] > 0)
            .map(tipo => ({
                id_tipo_ticket: tipo.id,
                cantidad: cantidades[tipo.id],
                precio_unitario: parseFloat(tipo.precio_base)
            }));

        console.log('Navegando a payment con:', { selectedSeats, funcion, pelicula, tickets, misAsientos });
        
        setIsNavigating(true);
        navigate('/payment', {
            state: {
                selectedSeats,
                funcion,
                pelicula,
                tickets,
                subtotalTickets: subtotal,
                timeRemaining,
                misAsientos
            }
        });
    };

    const handleBack = () => {
        // NO liberamos asientos, solo navegamos de vuelta
        setIsNavigating(true);
        navigate('/seat-selection', {
            state: {
                funcion,
                pelicula,
                selectedSeats, // Mantener asientos seleccionados
                misAsientos    // Mantener IDs de mis asientos
            }
        });
    };

    if (loading) {
        return <div className="ticket-type"><p>Cargando tipos de ticket...</p></div>;
    }

    const totalTickets = Object.values(cantidades).reduce((sum, cant) => sum + cant, 0);

    return (
        <div className="ticket-type">
            <div className="ticket-header">
                <h2>Selecciona Tipos de Ticket</h2>
                <p className="movie-info">
                    {pelicula?.titulo} - {funcion?.fecha} {funcion?.hora}
                </p>
                <p className="seats-info">
                    Asientos: <strong>{selectedSeats.map(s => s.id).join(', ')}</strong>
                </p>
                <div className="timer">
                    <span className="timer-icon">⏰</span>
                    Tiempo restante: <strong>{formatTime(timeRemaining)}</strong>
                </div>
            </div>

            <div className="ticket-types-grid">
                {tiposTicket.map((tipo) => (
                    <div key={tipo.id} className="ticket-card">
                        <div className="ticket-info">
                            <h3>{tipo.nombre}</h3>
                            <p className="ticket-price">S/ {parseFloat(tipo.precio_base).toFixed(2)}</p>
                        </div>
                        <div className="ticket-quantity">
                            <button
                                onClick={() => handleCantidadChange(tipo.id, (cantidades[tipo.id] || 0) - 1)}
                                disabled={cantidades[tipo.id] === 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="0"
                                max={selectedSeats.length}
                                value={cantidades[tipo.id] || 0}
                                onChange={(e) => handleCantidadChange(tipo.id, e.target.value)}
                            />
                            <button
                                onClick={() => handleCantidadChange(tipo.id, (cantidades[tipo.id] || 0) + 1)}
                                disabled={totalTickets >= selectedSeats.length}
                            >
                                +
                            </button>
                        </div>
                        {cantidades[tipo.id] > 0 && (
                            <p className="ticket-subtotal">
                                Subtotal: S/ {(cantidades[tipo.id] * parseFloat(tipo.precio_base)).toFixed(2)}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="ticket-summary">
                <div className="summary-row">
                    <span>Tickets seleccionados:</span>
                    <strong>{totalTickets} / {selectedSeats.length}</strong>
                </div>
                <div className="summary-row total">
                    <span>Subtotal Tickets:</span>
                    <strong>S/ {subtotal.toFixed(2)}</strong>
                </div>
            </div>

            <div className="action-buttons">
                <button className="back-btn" onClick={handleBack}>
                    ← Volver a asientos
                </button>
                <button
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={totalTickets !== selectedSeats.length}
                >
                    Continuar al pago →
                </button>
            </div>
        </div>
    );
}

export default TicketType;
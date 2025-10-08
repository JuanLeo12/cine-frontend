import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { tiposEntrada } from '../../data/mockData';
import './css/TicketType.css';

function TicketType() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const selectedSeats = location.state?.selectedSeats || [];

    const [ticketTypes, setTicketTypes] = useState([]);

    useEffect(() => {
        if (selectedSeats.length > 0) {
            const initial = selectedSeats.map(() => ({ id: '', tipo: 'general' }));
            setTicketTypes(initial);
        }
    }, [selectedSeats]);

    const handleChange = (index, tipo) => {
        const updated = [...ticketTypes];
        updated[index] = { id: selectedSeats[index], tipo };
        setTicketTypes(updated);
    };

    const handleContinue = () => {
        navigate('/combos', { state: { selectedSeats, ticketTypes } });
    };

    return (
        <div className="ticket-type">
            <h2>Selecciona el tipo de entrada</h2>
            <div className="ticket-list">
                {ticketTypes.map((_, index) => (
                    <div key={index} className="ticket-item">
                        <label>Asiento {selectedSeats[index]}:</label>
                        <select
                            value={ticketTypes[index]?.tipo || 'general'}
                            onChange={(e) => handleChange(index, e.target.value)}
                        >
                            {tiposEntrada.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <button className="continue-btn" onClick={handleContinue}>
                Continuar
            </button>
        </div>
    );
}

export default TicketType;
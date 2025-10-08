import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { asientosSala } from '../../data/mockData';
import './css/SeatSelection.css';

function SeatSelection() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [count, setCount] = useState(1);

    const salaAsientos = asientosSala('101', movieId, '15:30'); // Simulamos sede y horario

    const toggleSeat = (id) => {
        if (selectedSeats.includes(id)) {
            setSelectedSeats(selectedSeats.filter(seatId => seatId !== id));
        } else if (selectedSeats.length < count) {
            setSelectedSeats([...selectedSeats, id]);
        }
    };

    const handleContinue = () => {
        navigate(`/ticket-type/${movieId}`, { state: { selectedSeats } });
    };

    return (
        <div className="seat-selection">
            <h2>Selecciona tus asientos</h2>
            <div className="controls">
                <label>Cantidad de asientos: </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                />
            </div>
            <div className="screen">PANTALLA</div>
            <div className="seats-grid">
                {salaAsientos.map((seat) => (
                    <button
                        key={seat.id}
                        className={`seat ${!seat.disponible ? 'occupied' : selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                        onClick={() => seat.disponible && toggleSeat(seat.id)}
                        disabled={!seat.disponible}
                    >
                        {seat.id}
                    </button>
                ))}
            </div>
            <button className="continue-btn" onClick={handleContinue} disabled={selectedSeats.length !== count}>
                Continuar
            </button>
        </div>
    );
}

export default SeatSelection;
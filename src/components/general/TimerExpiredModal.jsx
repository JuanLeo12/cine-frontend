import React from 'react';
import './css/TimerExpiredModal.css';

function TimerExpiredModal({ onExtend, onExit }) {
    return (
        <div className="timer-modal-overlay">
            <div className="timer-modal">
                <div className="timer-modal-icon">⏰</div>
                <h2>Tiempo Agotado</h2>
                <p>Tu tiempo de selección ha expirado.</p>
                <p className="timer-modal-subtitle">
                    ¿Deseas extender el tiempo por 5 minutos más o salir?
                </p>
                
                <div className="timer-modal-buttons">
                    <button 
                        className="timer-btn timer-btn-exit" 
                        onClick={onExit}
                    >
                        Salir
                    </button>
                    <button 
                        className="timer-btn timer-btn-extend" 
                        onClick={onExtend}
                    >
                        Extender Tiempo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TimerExpiredModal;

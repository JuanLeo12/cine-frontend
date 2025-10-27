import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComboCard from '../../components/comp/ComboCard';
import { getCombos } from '../../services/api';
import { usePurchase } from '../../context/PurchaseContext';
import './css/Combos.css';

function Combos() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedSeats, funcion, pelicula, tickets, subtotalTickets, timeRemaining, misAsientos } = location.state || {};
    const { formatTime } = usePurchase();

    const [cart, setCart] = useState([]);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCombos();
    }, []);

    const cargarCombos = async () => {
        try {
            const data = await getCombos();
            setCombos(data);
        } catch (error) {
            console.error('Error cargando combos:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (combo) => {
        const existing = cart.find(c => c.id === combo.id);
        if (existing) {
            setCart(cart.map(c => c.id === combo.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...combo, quantity: 1 }]);
        }
    };

    const decreaseQuantity = (comboId) => {
        const existing = cart.find(c => c.id === comboId);
        if (existing.quantity === 1) {
            // Eliminar del carrito
            setCart(cart.filter(c => c.id !== comboId));
        } else {
            setCart(cart.map(c => c.id === comboId ? { ...c, quantity: c.quantity - 1 } : c));
        }
    };

    const handleBack = () => {
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

    const handleContinue = () => {
        navigate('/payment', { 
            state: { 
                selectedSeats, 
                funcion,
                pelicula,
                tickets, 
                subtotalTickets,
                timeRemaining,
                misAsientos,
                cart 
            } 
        });
    };

    const handleSkip = () => {
        navigate('/payment', { 
            state: { 
                selectedSeats, 
                funcion,
                pelicula,
                tickets, 
                subtotalTickets,
                timeRemaining,
                misAsientos,
                cart: [] // Sin combos
            } 
        });
    };

    if (loading) {
        return (
            <div className="combos-page">
                <p>Cargando combos...</p>
            </div>
        );
    }

    return (
        <div className="combos-page">
            <div className="combos-header">
                <div>
                    <h2>🍿 Agrega Combos (Opcional)</h2>
                    <p className="combos-subtitle">Complementa tu experiencia de cine</p>
                </div>
                {timeRemaining && (
                    <div className="timer-display">
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-text">{formatTime(timeRemaining)}</span>
                    </div>
                )}
            </div>
            
            <div className="combo-grid">
                {combos.map(combo => {
                    const inCart = cart.find(c => c.id === combo.id);
                    return (
                        <div key={combo.id} className="combo-card-wrapper">
                            <ComboCard combo={combo} />
                            <div className="combo-controls">
                                {inCart ? (
                                    <>
                                        <button className="qty-btn" onClick={() => decreaseQuantity(combo.id)}>
                                            −
                                        </button>
                                        <span className="qty-display">{inCart.quantity}</span>
                                        <button className="qty-btn" onClick={() => addToCart(combo)}>
                                            +
                                        </button>
                                    </>
                                ) : (
                                    <button className="add-combo-btn" onClick={() => addToCart(combo)}>
                                        Agregar al Carrito
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="cart-summary">
                <h3>🛒 Tu Carrito de Combos</h3>
                {cart.length === 0 ? (
                    <p className="empty-cart">No hay combos agregados</p>
                ) : (
                    <ul>
                        {cart.map(item => (
                            <li key={item.id}>
                                <span>{item.nombre} x{item.quantity}</span>
                                <span className="item-price">S/ {(item.precio * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {cart.length > 0 && (
                    <div className="cart-total">
                        <strong>Total Combos:</strong>
                        <strong className="total-amount">
                            S/ {cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0).toFixed(2)}
                        </strong>
                    </div>
                )}
            </div>
            
            <div className="action-buttons">
                <button className="back-btn" onClick={handleBack}>
                    ← Volver
                </button>
                <button 
                    className="skip-btn" 
                    onClick={handleSkip}
                    disabled={cart.length > 0}
                >
                    Omitir Combos →
                </button>
                <button className="continue-btn" onClick={handleContinue}>
                    Continuar al Pago →
                </button>
            </div>
        </div>
    );
}

export default Combos;
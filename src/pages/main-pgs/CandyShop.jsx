import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ComboCard from '../../components/comp/ComboCard';
import { getCombos } from '../../services/api';
import './css/CandyShop.css';

function CandyShop() {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [combos, setCombos] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarCombos = async () => {
            try {
                const data = await getCombos();
                setCombos(data);
            } catch (error) {
                console.error('Error al cargar combos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCombos();
    }, []);

    const agregarAlCarrito = (combo) => {
        const existente = cart.find(item => item.id === combo.id);
        
        if (existente) {
            setCart(cart.map(item => 
                item.id === combo.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...combo, quantity: 1 }]);
        }
    };

    const eliminarDelCarrito = (comboId) => {
        setCart(cart.filter(item => item.id !== comboId));
    };

    const actualizarCantidad = (comboId, cantidad) => {
        if (cantidad <= 0) {
            eliminarDelCarrito(comboId);
            return;
        }
        
        setCart(cart.map(item =>
            item.id === comboId
                ? { ...item, quantity: cantidad }
                : item
        ));
    };

    const calcularTotal = () => {
        return cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    };

    const handleComprar = () => {
        if (!isLoggedIn) {
            alert('⚠️ Debes iniciar sesión para realizar compras');
            return;
        }

        // Bloquear admins de hacer compras
        if (user?.rol === 'admin') {
            alert('⚠️ Los administradores no pueden realizar compras. Esta función es solo para clientes.');
            return;
        }

        if (cart.length === 0) {
            alert('⚠️ Agrega al menos un combo al carrito');
            return;
        }

        // Navegar al pago con solo combos (sin función/película)
        navigate('/payment', {
            state: {
                cart,
                subtotalTickets: 0,
                tickets: [],
                soloCompra: 'combos', // Flag para identificar compra solo de combos
                selectedSeats: [],
                funcion: null,
                pelicula: null
            }
        });
    };

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando dulcería...</p>;
    }

    const total = calcularTotal();

    return (
        <div className="candyshop">
            <h1 style={{ textAlign: 'center', color: '#e60000', marginBottom: '2rem' }}>
                🍿 Chocolatería
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
                Disfruta de nuestros deliciosos combos mientras ves tu película favorita
            </p>

            {/* Carrito Flotante */}
            {cart.length > 0 && (
                <div className="cart-floating">
                    <h3>🛒 Mi Carrito ({cart.length})</h3>
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <span>{item.nombre}</span>
                                <div className="cart-item-controls">
                                    <button onClick={() => actualizarCantidad(item.id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => actualizarCantidad(item.id, item.quantity + 1)}>+</button>
                                    <button 
                                        className="btn-remove"
                                        onClick={() => eliminarDelCarrito(item.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <span className="cart-item-price">S/ {(item.precio * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="cart-total">
                        <strong>Total: S/ {total.toFixed(2)}</strong>
                    </div>
                    <button className="btn-comprar-cart" onClick={handleComprar}>
                        Proceder al Pago
                    </button>
                </div>
            )}

            <div className="combo-grid">
                {combos.length > 0 ? (
                    combos.map(combo => (
                        <div key={combo.id} className="combo-card-wrapper">
                            <ComboCard combo={combo} />
                            <button 
                                className="btn-agregar-combo"
                                onClick={() => agregarAlCarrito(combo)}
                            >
                                🛒 Agregar al Carrito
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', width: '100%' }}>
                        No hay combos disponibles en este momento.
                    </p>
                )}
            </div>
        </div>
    );
}

export default CandyShop;
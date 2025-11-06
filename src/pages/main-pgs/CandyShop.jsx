import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePurchase } from '../../context/PurchaseContext';
import ComboCard from '../../components/comp/ComboCard';
import { getCombos } from '../../services/api';
import './css/CandyShop.css';

function CandyShop() {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const { stopTimer, timerActive, clearPurchase } = usePurchase();
    const [combos, setCombos] = useState([]);
    const [combosFiltrados, setCombosFiltrados] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Limpiar cualquier compra anterior al entrar a la dulcería standalone
    useEffect(() => {
        // 🚫 RESTRICCIÓN: Usuarios corporativos no pueden comprar en CandyShop
        if (user && user.rol === 'corporativo') {
            alert('⚠️ Los usuarios corporativos solo pueden realizar compras en el apartado "Ventas Corporativas".\n\nPara comprar combos regulares, por favor utiliza una cuenta de cliente.');
            navigate('/');
            return;
        }
        
        // Solo limpiar si hay un timer activo de una compra anterior
        if (timerActive) {
            clearPurchase(); // Esto llama stopTimer() internamente
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Agregar user a las dependencias

    useEffect(() => {
        const cargarCombos = async () => {
            try {
                const data = await getCombos();
                setCombos(data);
                setCombosFiltrados(data);
            } catch (error) {
                console.error('Error al cargar combos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCombos();
    }, []);

    // Filtrar combos cuando cambia el filtro
    useEffect(() => {
        if (filtroActivo === 'todos') {
            setCombosFiltrados(combos);
        } else {
            setCombosFiltrados(combos.filter(combo => combo.tipo === filtroActivo));
        }
    }, [filtroActivo, combos]);

    const cambiarFiltro = (tipo) => {
        setFiltroActivo(tipo);
    };

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

        // Detener cualquier timer que esté activo (por si acaso)
        if (timerActive) {
            stopTimer();
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
            <h1 style={{ textAlign: 'center', color: '#e60000', marginBottom: '1rem' }}>
                🍿 Dulcería
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
                Disfruta de nuestros deliciosos productos mientras ves tu película favorita
            </p>

            {/* Filtros de Tipo */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '1rem', 
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <button 
                    className={`filter-btn ${filtroActivo === 'todos' ? 'active' : ''}`}
                    onClick={() => cambiarFiltro('todos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        backgroundColor: filtroActivo === 'todos' ? '#e60000' : '#f0f0f0',
                        color: filtroActivo === 'todos' ? 'white' : '#333',
                        transition: 'all 0.3s ease',
                        boxShadow: filtroActivo === 'todos' ? '0 4px 8px rgba(230, 0, 0, 0.3)' : 'none'
                    }}
                >
                    🎬 Todos
                </button>
                <button 
                    className={`filter-btn ${filtroActivo === 'popcorn' ? 'active' : ''}`}
                    onClick={() => cambiarFiltro('popcorn')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        backgroundColor: filtroActivo === 'popcorn' ? '#ffa726' : '#f0f0f0',
                        color: filtroActivo === 'popcorn' ? 'white' : '#333',
                        transition: 'all 0.3s ease',
                        boxShadow: filtroActivo === 'popcorn' ? '0 4px 8px rgba(255, 167, 38, 0.3)' : 'none'
                    }}
                >
                    🍿 Popcorn
                </button>
                <button 
                    className={`filter-btn ${filtroActivo === 'bebidas' ? 'active' : ''}`}
                    onClick={() => cambiarFiltro('bebidas')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        backgroundColor: filtroActivo === 'bebidas' ? '#42a5f5' : '#f0f0f0',
                        color: filtroActivo === 'bebidas' ? 'white' : '#333',
                        transition: 'all 0.3s ease',
                        boxShadow: filtroActivo === 'bebidas' ? '0 4px 8px rgba(66, 165, 245, 0.3)' : 'none'
                    }}
                >
                    🥤 Bebidas
                </button>
                <button 
                    className={`filter-btn ${filtroActivo === 'combos' ? 'active' : ''}`}
                    onClick={() => cambiarFiltro('combos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        backgroundColor: filtroActivo === 'combos' ? '#66bb6a' : '#f0f0f0',
                        color: filtroActivo === 'combos' ? 'white' : '#333',
                        transition: 'all 0.3s ease',
                        boxShadow: filtroActivo === 'combos' ? '0 4px 8px rgba(102, 187, 106, 0.3)' : 'none'
                    }}
                >
                    🎁 Combos
                </button>
            </div>

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
                {combosFiltrados.length > 0 ? (
                    combosFiltrados.map(combo => (
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
                        No hay productos disponibles en esta categoría.
                    </p>
                )}
            </div>
        </div>
    );
}

export default CandyShop;
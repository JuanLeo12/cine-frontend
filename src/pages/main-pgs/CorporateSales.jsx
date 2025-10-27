import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValesCorporativos, validarValeCorporativo } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './css/CorporateSales.css';

function CorporateSales() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [valesDisponibles, setValesDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [codigoVale, setCodigoVale] = useState('');
    const [valeValidado, setValeValidado] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarVales();
    }, []);

    const cargarVales = async () => {
        try {
            setLoading(true);
            const vales = await getValesCorporativos();
            
            // Filtrar solo vales no usados y no expirados
            const fechaActual = new Date();
            const valesActivos = vales.filter(vale => {
                const fechaExpiracion = new Date(vale.fecha_expiracion);
                return !vale.usado && fechaActual <= fechaExpiracion;
            });
            
            setValesDisponibles(valesActivos);
        } catch (error) {
            console.error('Error cargando vales:', error);
            setError('Error al cargar vales disponibles');
        } finally {
            setLoading(false);
        }
    };

    const handleValidarVale = async (e) => {
        e.preventDefault();
        setError('');
        setValeValidado(null);

        if (!codigoVale.trim()) {
            setError('Por favor ingresa un código de vale');
            return;
        }

        try {
            const vale = await validarValeCorporativo(codigoVale);
            setValeValidado(vale);
            setError('');
        } catch (error) {
            setError(error.message || 'Vale inválido o expirado');
            setValeValidado(null);
        }
    };

    const handleUsarVale = () => {
        if (valeValidado) {
            // Redirigir al flujo de compra con el vale
            if (valeValidado.tipo === 'entrada') {
                navigate('/movies', { state: { valeCorporativo: valeValidado } });
            } else if (valeValidado.tipo === 'combo') {
                navigate('/combos', { state: { valeCorporativo: valeValidado } });
            }
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearPrecio = (valor) => {
        return `S/ ${parseFloat(valor).toFixed(2)}`;
    };

    if (loading) {
        return <div className="loading-spinner">Cargando vales corporativos...</div>;
    }

    return (
        <div className="corporate-sales">
            <div className="corporate-header">
                <h1>🏢 Ventas Corporativas</h1>
                <p className="corporate-subtitle">
                    Accede a tus vales corporativos y disfruta de beneficios exclusivos
                </p>
            </div>

            {/* Sección de validación de vale */}
            <div className="vale-validator-section">
                <h2>Validar Vale Corporativo</h2>
                <form onSubmit={handleValidarVale} className="vale-form">
                    <input
                        type="text"
                        placeholder="Ingresa el código de tu vale"
                        value={codigoVale}
                        onChange={(e) => setCodigoVale(e.target.value.toUpperCase())}
                        className="vale-input"
                    />
                    <button type="submit" className="btn-validar">
                        🔍 Validar Vale
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {valeValidado && (
                    <div className="vale-validado-card">
                        <div className="vale-check">✅ Vale Válido</div>
                        <div className="vale-info">
                            <p><strong>Código:</strong> {valeValidado.codigo}</p>
                            <p><strong>Tipo:</strong> {valeValidado.tipo === 'entrada' ? '🎫 Entrada' : '🍿 Combo'}</p>
                            <p><strong>Valor:</strong> {formatearPrecio(valeValidado.valor)}</p>
                            <p><strong>Expira:</strong> {formatearFecha(valeValidado.fecha_expiracion)}</p>
                        </div>
                        <button onClick={handleUsarVale} className="btn-usar-vale">
                            Usar Vale Ahora
                        </button>
                    </div>
                )}
            </div>

            {/* Sección de vales disponibles (solo para usuarios corporativos) */}
            {user && (user.rol === 'corporativo' || user.rol === 'admin') && (
                <div className="vales-disponibles-section">
                    <h2>Mis Vales Disponibles ({valesDisponibles.length})</h2>
                    
                    {valesDisponibles.length === 0 ? (
                        <div className="no-vales">
                            <p>📋 No tienes vales disponibles en este momento</p>
                            <p className="no-vales-subtitle">
                                Contacta a tu administrador para obtener vales corporativos
                            </p>
                        </div>
                    ) : (
                        <div className="vales-grid">
                            {valesDisponibles.map(vale => (
                                <div key={vale.id} className="vale-card">
                                    <div className="vale-tipo-badge">
                                        {vale.tipo === 'entrada' ? '🎫 ENTRADA' : '🍿 COMBO'}
                                    </div>
                                    <div className="vale-codigo">
                                        <strong>Código:</strong> {vale.codigo}
                                    </div>
                                    <div className="vale-valor">
                                        {formatearPrecio(vale.valor)}
                                    </div>
                                    <div className="vale-expiracion">
                                        ⏰ Válido hasta: {formatearFecha(vale.fecha_expiracion)}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCodigoVale(vale.codigo);
                                            setValeValidado(vale);
                                            setError('');
                                        }}
                                        className="btn-seleccionar-vale"
                                    >
                                        Seleccionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Información para usuarios no corporativos */}
            {user && user.rol === 'cliente' && (
                <div className="info-corporativa">
                    <h2>¿Interesado en Ventas Corporativas?</h2>
                    <div className="info-card">
                        <h3>Beneficios para tu empresa:</h3>
                        <ul>
                            <li>✅ Tarifas preferenciales para grupos</li>
                            <li>✅ Vales prepagados con descuento</li>
                            <li>✅ Gestión centralizada de compras</li>
                            <li>✅ Reportes detallados de uso</li>
                            <li>✅ Atención personalizada</li>
                        </ul>
                        <p className="info-contacto">
                            <strong>Contacto:</strong> ventas@cinestar.com | Tel: (01) 555-CINE
                        </p>
                    </div>
                </div>
            )}

            {/* Información para visitantes no logueados */}
            {!user && (
                <div className="info-corporativa">
                    <h2>Servicios Corporativos</h2>
                    <div className="info-card">
                        <p>
                            Inicia sesión con tu cuenta corporativa para acceder a tus vales 
                            y beneficios exclusivos.
                        </p>
                        <button onClick={() => navigate('/')} className="btn-login">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CorporateSales;
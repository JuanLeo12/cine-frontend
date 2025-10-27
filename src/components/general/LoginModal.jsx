// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './css/LoginModal.css';

function LoginModal({ onClose }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Iniciar sesión
                const result = await login(email, password);
                if (result.success) {
                    onClose();
                    // Redirigir a home después de login exitoso
                    navigate('/');
                } else {
                    setError(result.error || 'Credenciales incorrectas');
                }
            } else {
                // Registrar usuario
                const result = await register({
                    nombre: nombre.trim(),
                    email: email.trim(),
                    password,
                    telefono: telefono.trim() || null,
                    rol: 'cliente' // Por defecto los usuarios son clientes
                });

                if (result.success) {
                    alert('Usuario registrado con éxito. Por favor inicia sesión.');
                    setIsLogin(true);
                    setNombre('');
                    setTelefono('');
                    setPassword('');
                } else {
                    setError(result.error || 'Error al registrar usuario');
                }
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
            console.error('Error en autenticación:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                disabled={loading}
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>
                <p>
                    {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{' '}
                    <button 
                        className="switch-mode" 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        disabled={loading}
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                    </button>
                </p>
                <button className="close-btn" onClick={onClose} disabled={loading}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}

export default LoginModal;
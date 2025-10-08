// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './css/LoginModal.css';

function LoginModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            const success = login(email, password);
            if (success) {
                onClose();
            } else {
                setError('Credenciales incorrectas');
            }
        } else {
            // Simular registro (en una app real, esto iría a una API)
            alert(`Usuario ${nombre} registrado con éxito.`);
            setIsLogin(true);
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
                                placeholder="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</button>
                </form>
                <p>
                    {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{' '}
                    <button className="switch-mode" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                    </button>
                </p>
                <button className="close-btn" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
}

export default LoginModal;
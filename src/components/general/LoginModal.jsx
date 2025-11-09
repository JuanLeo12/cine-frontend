// src/components/LoginModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, InputGroup } from 'react-bootstrap';
import './css/LoginModal.css';

function LoginModal({ onClose }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [rol, setRol] = useState('cliente'); // cliente o corporativo
    
    // Campos comunes
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    
    // Campos solo para CLIENTE
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [genero, setGenero] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('');
    
    // Campos solo para CORPORATIVO
    const [ruc, setRuc] = useState('');
    const [representante, setRepresentante] = useState('');
    const [cargo, setCargo] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false);

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
                    navigate('/');
                } else {
                    setError(result.error || 'Credenciales incorrectas');
                }
            } else {
                // Registrar usuario
                let userData = {
                    email: email.trim(),
                    password,
                    rol
                };

                if (rol === 'cliente') {
                    // Campos obligatorios para cliente
                    userData = {
                        ...userData,
                        nombre: nombre.trim(),
                        apellido: apellido.trim(),
                        dni: dni.trim(),
                        telefono: telefono.trim(),
                        direccion: direccion.trim(),
                        fecha_nacimiento: fechaNacimiento,
                        genero: genero,
                        foto_perfil: fotoPerfil || null // Opcional
                    };
                } else if (rol === 'corporativo') {
                    // Campos obligatorios para corporativo
                    userData = {
                        ...userData,
                        nombre: nombre.trim(), // Nombre de la empresa
                        ruc: ruc.trim(),
                        representante: representante.trim(),
                        cargo: cargo.trim(),
                        telefono: telefono.trim(),
                        direccion: direccion.trim()
                    };
                }

                const result = await register(userData);

                if (result.success) {
                    alert('✅ Usuario registrado con éxito. Por favor inicia sesión.');
                    // Limpiar formulario y cambiar a login
                    setIsLogin(true);
                    limpiarFormulario();
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

    const limpiarFormulario = () => {
        setNombre('');
        setApellido('');
        setDni('');
        setTelefono('');
        setDireccion('');
        setFechaNacimiento('');
        setGenero('');
        setFotoPerfil('');
        setRuc('');
        setRepresentante('');
        setCargo('');
        setPassword('');
        setError('');
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('La foto no debe superar los 2MB');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFotoPerfil(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{isLogin ? '🔐 Iniciar Sesión' : '✨ Crear Cuenta'}</h2>
                {error && <p className="error">❌ {error}</p>}
                
                <Form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="rol-selector">
                            <Form.Label>Tipo de cuenta:</Form.Label>
                            <div className="rol-options">
                                <Form.Check
                                    type="radio"
                                    id="rol-cliente"
                                    name="rol"
                                    label="👤 Cliente"
                                    value="cliente"
                                    checked={rol === 'cliente'}
                                    onChange={(e) => {
                                        setRol(e.target.value);
                                        limpiarFormulario();
                                    }}
                                    disabled={loading}
                                    className={rol === 'cliente' ? 'active' : ''}
                                />
                                <Form.Check
                                    type="radio"
                                    id="rol-corporativo"
                                    name="rol"
                                    label="🏢 Corporativo"
                                    value="corporativo"
                                    checked={rol === 'corporativo'}
                                    onChange={(e) => {
                                        setRol(e.target.value);
                                        limpiarFormulario();
                                    }}
                                    disabled={loading}
                                    className={rol === 'corporativo' ? 'active' : ''}
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && rol === 'cliente' && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre *"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Apellido *"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="DNI (8 dígitos) *"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    required
                                    maxLength="8"
                                    pattern="\d{8}"
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="tel"
                                    placeholder="Teléfono (9 dígitos) *"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    required
                                    maxLength="9"
                                    pattern="\d{9}"
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Dirección *"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="date"
                                    placeholder="Fecha de Nacimiento *"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Select
                                    value={genero}
                                    onChange={(e) => setGenero(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Selecciona género *</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="fotoPerfil">Foto de Perfil (opcional)</Form.Label>
                                <Form.Control
                                    id="fotoPerfil"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    disabled={loading}
                                />
                                {fotoPerfil && (
                                    <div className="preview-foto-modal mt-2">
                                        <img src={fotoPerfil} alt="Preview" />
                                    </div>
                                )}
                            </Form.Group>
                        </>
                    )}

                    {!isLogin && rol === 'corporativo' && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre de la Empresa *"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="RUC (11 dígitos) *"
                                    value={ruc}
                                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    required
                                    maxLength="11"
                                    pattern="\d{11}"
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre del Representante *"
                                    value={representante}
                                    onChange={(e) => setRepresentante(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Cargo del Representante *"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="tel"
                                    placeholder="Teléfono (9 dígitos) *"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    required
                                    maxLength="9"
                                    pattern="\d{9}"
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Dirección de la Empresa *"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="email"
                            placeholder="Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña (8-16 caracteres) *"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={8}
                                maxLength={16}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                tabIndex="-1"
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? '👁️‍🗨️' : '👁️'}
                            </Button>
                        </InputGroup>
                    </Form.Group>
                    
                    <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                        {loading ? '⏳ Procesando...' : (isLogin ? '🔓 Iniciar Sesión' : '✅ Registrarse')}
                    </Button>
                </Form>
                
                <p className="switch-text text-center">
                    {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{' '}
                    <Button 
                        variant="link" 
                        className="switch-mode p-0" 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            limpiarFormulario();
                        }}
                        disabled={loading}
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                    </Button>
                </p>
                
                <Button variant="secondary" className="close-btn w-100" onClick={onClose} disabled={loading}>
                    ✖️ Cerrar
                </Button>
            </div>
        </div>,
        document.body
    );
}

export default LoginModal;
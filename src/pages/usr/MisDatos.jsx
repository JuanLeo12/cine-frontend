import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePerfil } from '../../services/api';
import './css/MisDatos.css';

function MisDatos() {
    const { user, setUser } = useAuth();
    
    // Determinar campos obligatorios según rol
    const isCliente = user?.rol === 'cliente';
    const isCorporativo = user?.rol === 'corporativo';
    const isAdmin = user?.rol === 'admin';

    const [nombre, setNombre] = useState(user?.nombre || '');
    const [apellido, setApellido] = useState(user?.apellido || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dni, setDni] = useState(user?.dni || '');
    const [ruc, setRuc] = useState(user?.ruc || '');
    const [representante, setRepresentante] = useState(user?.representante || '');
    const [cargo, setCargo] = useState(user?.cargo || '');
    const [telefono, setTelefono] = useState(user?.telefono || '');
    const [direccion, setDireccion] = useState(user?.direccion || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(user?.fecha_nacimiento || '');
    const [genero, setGenero] = useState(user?.genero || '');
    const [fotoPerfil, setFotoPerfil] = useState(user?.foto_perfil || '');
    const [previewFoto, setPreviewFoto] = useState(user?.foto_perfil || '');
    const [loading, setLoading] = useState(false);
    
    // Estados para cambiar contraseña
    const [cambiarPassword, setCambiarPassword] = useState(false);
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    
    // Estados para mostrar/ocultar contraseñas
    const [showPasswordActual, setShowPasswordActual] = useState(false);
    const [showPasswordNueva, setShowPasswordNueva] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const payload = {
                nombre,
                email
            };
            
            // Agregar campos según el rol
            if (isCliente) {
                payload.apellido = apellido;
                payload.dni = dni;
                payload.telefono = telefono;
                payload.direccion = direccion;
                payload.fecha_nacimiento = fechaNacimiento;
                payload.genero = genero;
                payload.foto_perfil = fotoPerfil;
            } else if (isCorporativo) {
                payload.ruc = ruc;
                payload.representante = representante;
                payload.cargo = cargo;
                payload.telefono = telefono;
                payload.direccion = direccion;
            }
            // Admin solo actualiza nombre y email
            
            // Si quiere cambiar contraseña, validar y agregar
            if (cambiarPassword) {
                if (!passwordActual || !passwordNueva || !passwordConfirm) {
                    alert('⚠️ Completa todos los campos de contraseña');
                    setLoading(false);
                    return;
                }
                if (passwordNueva !== passwordConfirm) {
                    alert('⚠️ Las contraseñas nuevas no coinciden');
                    setLoading(false);
                    return;
                }
                if (passwordNueva.length < 8 || passwordNueva.length > 16) {
                    alert('⚠️ La contraseña debe tener entre 8 y 16 caracteres');
                    setLoading(false);
                    return;
                }
                
                payload.passwordActual = passwordActual;
                payload.password = passwordNueva;
            }

            const datosActualizados = await updatePerfil(payload);

            // backend devuelve { mensaje, usuario }
            const updatedUser = { ...user, ...(datosActualizados.usuario || datosActualizados) };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('✅ Datos actualizados correctamente.');
            
            // Limpiar campos de contraseña
            if (cambiarPassword) {
                setPasswordActual('');
                setPasswordNueva('');
                setPasswordConfirm('');
                setCambiarPassword(false);
            }
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            alert('❌ Error al actualizar los datos: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ La imagen es muy grande. Por favor, selecciona una foto menor a 5MB.');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('⚠️ Por favor, selecciona un archivo de imagen válido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                // Comprimir imagen a máx 800x800px
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                const maxSize = 800;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a base64 con calidad 0.8
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setFotoPerfil(compressedDataUrl);
                setPreviewFoto(compressedDataUrl);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="mis-datos">
            <h2>📝 Mis Datos Personales</h2>
            <div className="rol-badge">
                {isCliente && '👤 Cliente'}
                {isCorporativo && '🏢 Corporativo'}
                {isAdmin && '🔑 Administrador'}
            </div>
            
            <form onSubmit={handleGuardar} className="datos-form">
                {/* Campos comunes para todos */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nombre">
                            {isCorporativo ? 'Nombre de la Empresa' : 'Nombre'} <span className="required">*</span>
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder={isCorporativo ? "Nombre de la empresa" : "Tu nombre"}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email <span className="required">*</span></label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                </div>

                {/* Campos específicos para CLIENTE */}
                {isCliente && (
                    <>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido <span className="required">*</span></label>
                                <input
                                    id="apellido"
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    required
                                    placeholder="Tu apellido"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dni">DNI <span className="required">*</span></label>
                                <input
                                    id="dni"
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    required
                                    maxLength="8"
                                    pattern="\d{8}"
                                    placeholder="12345678"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono <span className="required">*</span></label>
                                <input
                                    id="telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    required
                                    maxLength="9"
                                    pattern="\d{9}"
                                    placeholder="999999999"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="required">*</span></label>
                                <input
                                    id="fechaNacimiento"
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="direccion">Dirección <span className="required">*</span></label>
                            <input
                                id="direccion"
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                required
                                placeholder="Av. Ejemplo 123, Lima"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genero">Género <span className="required">*</span></label>
                            <select
                                id="genero"
                                value={genero}
                                onChange={(e) => setGenero(e.target.value)}
                                required
                            >
                                <option value="">Selecciona...</option>
                                <option value="masculino">Masculino</option>
                                <option value="femenino">Femenino</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Foto de Perfil</label>
                            <input type="file" accept="image/*" onChange={handleFotoChange} />
                            {previewFoto && (
                                <div className="preview-foto">
                                    <img src={previewFoto} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Campos específicos para CORPORATIVO */}
                {isCorporativo && (
                    <>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ruc">RUC <span className="required">*</span></label>
                                <input
                                    id="ruc"
                                    type="text"
                                    value={ruc}
                                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    required
                                    maxLength="11"
                                    pattern="\d{11}"
                                    placeholder="20123456789"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono <span className="required">*</span></label>
                                <input
                                    id="telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    required
                                    maxLength="9"
                                    pattern="\d{9}"
                                    placeholder="999999999"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="representante">Representante Legal <span className="required">*</span></label>
                                <input
                                    id="representante"
                                    type="text"
                                    value={representante}
                                    onChange={(e) => setRepresentante(e.target.value)}
                                    required
                                    placeholder="Nombre del representante"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cargo">Cargo <span className="required">*</span></label>
                                <input
                                    id="cargo"
                                    type="text"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    required
                                    placeholder="Gerente General"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="direccion">Dirección <span className="required">*</span></label>
                            <input
                                id="direccion"
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                required
                                placeholder="Av. Ejemplo 123, Lima"
                            />
                        </div>
                    </>
                )}
                
                {/* Sección cambiar contraseña (para todos) */}
                <div className="form-group full-width">
                    <label>
                        <input
                            type="checkbox"
                            checked={cambiarPassword}
                            onChange={(e) => setCambiarPassword(e.target.checked)}
                        />
                        {' '}Cambiar contraseña
                    </label>
                </div>
                
                {cambiarPassword && (
                    <>
                        <div className="form-group">
                            <label htmlFor="passwordActual">Contraseña Actual <span className="required">*</span></label>
                            <div className="password-input-group">
                                <input
                                    id="passwordActual"
                                    type={showPasswordActual ? "text" : "password"}
                                    value={passwordActual}
                                    onChange={(e) => setPasswordActual(e.target.value)}
                                    placeholder="Ingresa tu contraseña actual"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswordActual(!showPasswordActual)}
                                    tabIndex="-1"
                                >
                                    {showPasswordActual ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="passwordNueva">Nueva Contraseña <span className="required">*</span></label>
                            <div className="password-input-group">
                                <input
                                    id="passwordNueva"
                                    type={showPasswordNueva ? "text" : "password"}
                                    value={passwordNueva}
                                    onChange={(e) => setPasswordNueva(e.target.value)}
                                    placeholder="8-16 caracteres"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                    tabIndex="-1"
                                >
                                    {showPasswordNueva ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="passwordConfirm">Confirmar Nueva Contraseña <span className="required">*</span></label>
                            <div className="password-input-group">
                                <input
                                    id="passwordConfirm"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    tabIndex="-1"
                                >
                                    {showPasswordConfirm ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <div className="form-actions">
                    <button type="submit" className="guardar-btn" disabled={loading}>
                        {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>

                <p className="form-note">
                    <span className="required">*</span> Campos obligatorios
                </p>
            </form>
        </div>
    );
}

export default MisDatos;
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updatePerfil } from '../../services/api';
import './css/MisDatos.css';

function MisDatos() {
    const { user, setUser } = useAuth();

    const [nombre, setNombre] = useState(user?.nombre || '');
    const [apellido, setApellido] = useState(user?.apellido || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dni, setDni] = useState(user?.dni || '');
    const [telefono, setTelefono] = useState(user?.telefono || '');
    const [direccion, setDireccion] = useState(user?.direccion || '');
    const [fechaNacimiento, setFechaNacimiento] = useState(user?.fecha_nacimiento || '');
    const [genero, setGenero] = useState(user?.genero || '');
    const [fotoPerfil, setFotoPerfil] = useState(user?.foto_perfil || '');
    const [previewFoto, setPreviewFoto] = useState(user?.foto_perfil || '');
    const [loading, setLoading] = useState(false);

    const handleGuardar = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const payload = {
                nombre,
                apellido,
                email,
                dni,
                telefono,
                direccion,
                fecha_nacimiento: fechaNacimiento,
                genero,
                foto_perfil: fotoPerfil
            };

            const datosActualizados = await updatePerfil(payload);

            // backend devuelve { mensaje, usuario }
            const updatedUser = { ...user, ...(datosActualizados.usuario || datosActualizados) };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('✅ Datos actualizados correctamente.');
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

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setFotoPerfil(dataUrl);
            setPreviewFoto(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="mis-datos">
            <h2>📝 Mis Datos Personales</h2>
            <form onSubmit={handleGuardar} className="datos-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre <span className="required">*</span></label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Ingresa tu nombre"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            id="apellido"
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            placeholder="Ingresa tu apellido"
                        />
                    </div>
                </div>

                <div className="form-row">
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
                    <div className="form-group">
                        <label htmlFor="dni">DNI</label>
                        <input
                            id="dni"
                            type="text"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            maxLength="8"
                            pattern="\d{8}"
                            placeholder="12345678"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input
                            id="telefono"
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            pattern="\d{7}|\d{9}"
                            placeholder="999999999"
                            title="Ingresa 7 dígitos (fijo) o 9 dígitos (celular)"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                        <input
                            id="fechaNacimiento"
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="direccion">Dirección</label>
                    <input
                        id="direccion"
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Av. Ejemplo 123, Lima"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genero">Género</label>

                <div className="form-group">
                    <label>Foto de Perfil</label>
                    <input type="file" accept="image/*" onChange={handleFotoChange} />
                    {previewFoto && (
                        <div className="preview-foto">
                            <img src={previewFoto} alt="Preview" />
                        </div>
                    )}
                </div>
                    <select
                        id="genero"
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                    >
                        <option value="">Selecciona...</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                        <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                </div>

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
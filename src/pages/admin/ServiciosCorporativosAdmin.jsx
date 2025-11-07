import React, { useState, useEffect } from 'react';
import { obtenerTodasBoletasCorporativas, descargarArchivoPublicidad } from '../../services/api';
import './css/ServiciosCorporativosAdmin.css';

function ServiciosCorporativosAdmin() {
    const [boletas, setBoletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, funcion_privada, alquiler_sala
    const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, activa, utilizada, cancelada
    const [boletaExpandida, setBoletaExpandida] = useState(null);

    useEffect(() => {
        cargarBoletas();
    }, []);

    const cargarBoletas = async () => {
        try {
            setLoading(true);
            const data = await obtenerTodasBoletasCorporativas();
            console.log('📋 Boletas corporativas cargadas:', data);
            setBoletas(data);
        } catch (error) {
            console.error('Error al cargar boletas:', error);
            alert('Error al cargar servicios corporativos');
        } finally {
            setLoading(false);
        }
    };

    const toggleBoleta = (boletaId) => {
        setBoletaExpandida(boletaExpandida === boletaId ? null : boletaId);
    };

    const extraerDatosQR = (codigo_qr) => {
        try {
            const datos = JSON.parse(codigo_qr);
            return datos;
        } catch (e) {
            return { codigo: codigo_qr };
        }
    };

    const obtenerInfoTipo = (tipo) => {
        const tipos = {
            'funcion_privada': { icono: '🎬', nombre: 'Función Privada' },
            'alquiler_sala': { icono: '🏢', nombre: 'Alquiler de Sala' },
            'publicidad': { icono: '📺', nombre: 'Publicidad' },
            'vales_corporativos': { icono: '🎫', nombre: 'Vales Corporativos' }
        };
        return tipos[tipo] || { icono: '📋', nombre: 'Servicio' };
    };

    const obtenerPrecio = (boleta) => {
        const detalles = boleta.detalles;
        if (boleta.tipo === 'funcion_privada') return detalles?.precio_corporativo;
        if (boleta.tipo === 'alquiler_sala') return detalles?.precio;
        if (boleta.tipo === 'publicidad') return detalles?.precio;
        if (boleta.tipo === 'vales_corporativos') return detalles?.pago?.monto_total; // Monto total pagado
        return null;
    };

    const obtenerCliente = (boleta) => {
        const detalles = boleta.detalles;
        if (boleta.tipo === 'funcion_privada') return detalles?.clienteCorporativo;
        if (boleta.tipo === 'alquiler_sala') return detalles?.usuario;
        if (boleta.tipo === 'publicidad') return detalles?.usuario;
        if (boleta.tipo === 'vales_corporativos') return detalles?.pago?.ordenCompra?.usuario; // Usuario del pago del vale
        return null;
    };

    const handleDescargarArchivo = async (idPublicidad) => {
        try {
            await descargarArchivoPublicidad(idPublicidad);
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            alert('Error al descargar el archivo. Por favor intenta de nuevo.');
        }
    };

    // Filtrar boletas
    const boletasFiltradas = boletas.filter(boleta => {
        if (filtroTipo !== 'todos' && boleta.tipo !== filtroTipo) return false;
        if (filtroEstado !== 'todos' && boleta.estado !== filtroEstado) return false;
        return true;
    });

    // Calcular estadísticas
    const stats = {
        total: boletas.length,
        funcionesPrivadas: boletas.filter(b => b.tipo === 'funcion_privada').length,
        alquileres: boletas.filter(b => b.tipo === 'alquiler_sala').length,
        publicidad: boletas.filter(b => b.tipo === 'publicidad').length,
        vales: boletas.filter(b => b.tipo === 'vales_corporativos').length,
        activas: boletas.filter(b => b.estado === 'activa').length,
        utilizadas: boletas.filter(b => b.estado === 'utilizada').length,
        ingresosTotales: boletas.reduce((sum, b) => {
            if (b.tipo === 'funcion_privada' && b.detalles?.precio_corporativo) {
                return sum + parseFloat(b.detalles.precio_corporativo);
            }
            if (b.tipo === 'alquiler_sala' && b.detalles?.precio) {
                return sum + parseFloat(b.detalles.precio);
            }
            if (b.tipo === 'publicidad' && b.detalles?.precio) {
                return sum + parseFloat(b.detalles.precio);
            }
            if (b.tipo === 'vales_corporativos' && b.detalles?.pago?.monto_total) {
                return sum + parseFloat(b.detalles.pago.monto_total);
            }
            return sum;
        }, 0)
    };

    if (loading) {
        return <div className="loading-spinner">Cargando servicios corporativos...</div>;
    }

    return (
        <div className="servicios-corporativos-admin">
            <div className="page-header">
                <h2>🏢 Gestión de Servicios Corporativos</h2>
                <p className="page-subtitle">Administra todos los servicios corporativos con boletas</p>
            </div>

            {/* Estadísticas rápidas */}
            <div className="quick-stats">
                <div className="quick-stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h4>Total Servicios</h4>
                        <p className="stat-number">{stats.total}</p>
                    </div>
                </div>
                <div className="quick-stat-card">
                    <div className="stat-icon">🎬</div>
                    <div className="stat-content">
                        <h4>Funciones Privadas</h4>
                        <p className="stat-number">{stats.funcionesPrivadas}</p>
                    </div>
                </div>
                <div className="quick-stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                        <h4>Alquileres</h4>
                        <p className="stat-number">{stats.alquileres}</p>
                    </div>
                </div>
                <div className="quick-stat-card">
                    <div className="stat-icon">📺</div>
                    <div className="stat-content">
                        <h4>Publicidad</h4>
                        <p className="stat-number">{stats.publicidad}</p>
                    </div>
                </div>
                <div className="quick-stat-card">
                    <div className="stat-icon">🎫</div>
                    <div className="stat-content">
                        <h4>Vales</h4>
                        <p className="stat-number">{stats.vales}</p>
                    </div>
                </div>
                <div className="quick-stat-card highlight">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h4>Ingresos Totales</h4>
                        <p className="stat-number">S/ {stats.ingresosTotales.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Tipo de Servicio:</label>
                    <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="funcion_privada">Función Privada</option>
                        <option value="alquiler_sala">Alquiler de Sala</option>
                        <option value="publicidad">Publicidad</option>
                        <option value="vales_corporativos">Vales Corporativos</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Estado:</label>
                    <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="activa">Activa</option>
                        <option value="utilizada">Utilizada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
                <div className="filter-info">
                    Mostrando {boletasFiltradas.length} de {boletas.length} servicios
                </div>
            </div>

            {/* Lista de boletas */}
            <div className="boletas-list">
                {boletasFiltradas.length === 0 ? (
                    <div className="no-data">
                        <p>📭 No hay servicios corporativos que coincidan con los filtros</p>
                    </div>
                ) : (
                    boletasFiltradas.map(boleta => {
                        const isExpanded = boletaExpandida === boleta.id;
                        const datosQR = extraerDatosQR(boleta.codigo_qr);
                        const detalles = boleta.detalles;
                        const tipoInfo = obtenerInfoTipo(boleta.tipo);
                        const precio = obtenerPrecio(boleta);
                        const cliente = obtenerCliente(boleta);

                        return (
                            <div key={boleta.id} className={`boleta-card ${boleta.tipo}`}>
                                <div className="boleta-header" onClick={() => toggleBoleta(boleta.id)}>
                                    <div className="boleta-info">
                                        <h3>
                                            {tipoInfo.icono} {tipoInfo.nombre}
                                            <span className="boleta-id">#{boleta.id}</span>
                                        </h3>
                                        <div className="boleta-summary">
                                            {(boleta.tipo === 'funcion_privada' || boleta.tipo === 'alquiler_sala') && (
                                                <>
                                                    <span className="boleta-date">
                                                        📅 {detalles?.fecha ? new Date(detalles.fecha + 'T00:00:00').toLocaleDateString('es-PE') : 'N/A'}
                                                    </span>
                                                    <span className="boleta-sede">
                                                        🏢 {detalles?.sala?.sede?.nombre || detalles?.sede?.nombre || 'N/A'}
                                                    </span>
                                                    <span className="boleta-sala">
                                                        🎬 {detalles?.sala?.nombre || 'N/A'}
                                                    </span>
                                                </>
                                            )}
                                            {boleta.tipo === 'publicidad' && (
                                                <>
                                                    <span className="boleta-date">
                                                        📅 {detalles?.fecha_inicio} - {detalles?.fecha_fin}
                                                    </span>
                                                    <span className="boleta-tipo">
                                                        📺 {detalles?.tipo?.toUpperCase() || 'N/A'}
                                                    </span>
                                                    <span className="boleta-sede">
                                                        🏢 {detalles?.sede?.nombre || 'N/A'}
                                                    </span>
                                                </>
                                            )}
                                            {boleta.tipo === 'vales_corporativos' && (
                                                <>
                                                    <span className="boleta-codigo">
                                                        🎫 {detalles?.codigo || 'N/A'}
                                                    </span>
                                                    <span className="boleta-tipo">
                                                        {detalles?.tipo === 'entrada' ? '🎬 Entrada' : '🍿 Combo'}
                                                    </span>
                                                    <span className="boleta-expira">
                                                        ⏰ Expira: {detalles?.fecha_expiracion || 'N/A'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="boleta-actions">
                                        <span className={`estado-badge ${boleta.estado}`}>
                                            {boleta.estado === 'activa' ? '✓ Activa' : 
                                             boleta.estado === 'utilizada' ? '✓ Utilizada' : 
                                             '✗ Cancelada'}
                                        </span>
                                        {precio && (
                                            <span className="boleta-precio">S/ {parseFloat(precio).toFixed(2)}</span>
                                        )}
                                        <button className="btn-expand">
                                            {isExpanded ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="boleta-details">
                                        {/* Información del cliente */}
                                        {cliente && (
                                            <div className="detail-section">
                                                <h4>👤 Información del Cliente</h4>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Cliente:</span>
                                                        <span className="detail-value">{cliente?.nombre || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Email:</span>
                                                        <span className="detail-value">{cliente?.email || 'N/A'}</span>
                                                    </div>
                                                    {cliente?.representante && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Representante:</span>
                                                            <span className="detail-value">{cliente.representante}</span>
                                                        </div>
                                                    )}
                                                    {cliente?.cargo && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Cargo:</span>
                                                            <span className="detail-value">{cliente.cargo}</span>
                                                        </div>
                                                    )}
                                                    {cliente?.ruc && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">RUC:</span>
                                                            <span className="detail-value">{cliente.ruc}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {boleta.tipo === 'publicidad' && detalles?.cliente && (
                                            <div className="detail-section">
                                                <h4>👤 Cliente Publicitario</h4>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Empresa:</span>
                                                        <span className="detail-value">{detalles.cliente}</span>
                                                    </div>
                                                    {/* Mostrar archivo de publicidad */}
                                                    {detalles?.archivo_publicidad && (
                                                        <div className="detail-item full-width">
                                                            <span className="detail-label">Archivo de Publicidad:</span>
                                                            <button
                                                                onClick={() => handleDescargarArchivo(detalles.id)}
                                                                className="btn-download-archivo"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    padding: '0.5rem 1rem',
                                                                    backgroundColor: '#1976d2',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                                                            >
                                                                📥 Descargar Archivo
                                                            </button>
                                                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                                                                Archivo: {detalles.archivo_publicidad.split('/').pop()}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Detalles del servicio */}
                                        {boleta.tipo !== 'vales_corporativos' ? (
                                            <div className="detail-section">
                                                <h4>📋 Detalles del Servicio</h4>
                                                <div className="detail-grid">
                                                    {boleta.tipo === 'funcion_privada' && detalles?.pelicula && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Película:</span>
                                                            <span className="detail-value">{detalles.pelicula.titulo}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <span className="detail-label">Sede:</span>
                                                        <span className="detail-value">
                                                            {detalles?.sala?.sede?.nombre || 'N/A'} - {detalles?.sala?.sede?.ciudad || ''}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Sala:</span>
                                                        <span className="detail-value">
                                                            {detalles?.sala?.nombre || 'N/A'} ({detalles?.sala?.tipo_sala || 'N/A'})
                                                        </span>
                                                    </div>
                                                    {boleta.tipo === 'alquiler_sala' && detalles?.sala?.capacidad && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Capacidad:</span>
                                                            <span className="detail-value">{detalles.sala.capacidad} personas</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <span className="detail-label">Fecha:</span>
                                                        <span className="detail-value">
                                                            {detalles?.fecha ? new Date(detalles.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Horario:</span>
                                                        <span className="detail-value">
                                                            {detalles?.hora_inicio || 'N/A'} - {detalles?.hora_fin || 'N/A'}
                                                        </span>
                                                    </div>
                                                    {detalles?.descripcion_evento && (
                                                        <div className="detail-item full-width">
                                                            <span className="detail-label">Descripción:</span>
                                                            <span className="detail-value">{detalles.descripcion_evento}</span>
                                                        </div>
                                                    )}
                                                    {precio && (
                                                        <div className="detail-item highlight">
                                                            <span className="detail-label">Precio Total:</span>
                                                            <span className="detail-value precio">S/ {parseFloat(precio).toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="detail-section">
                                                <h4>🎫 Detalles del Vale Corporativo</h4>
                                                <div className="detail-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Código del Vale:</span>
                                                        <span className="detail-value codigo">{detalles?.codigo || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Tipo de Vale:</span>
                                                        <span className="detail-value">{detalles?.tipo === 'entrada' ? '🎬 Entrada' : '🍿 Combo'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Descuento:</span>
                                                        <span className="detail-value valor-destacado">{parseFloat(detalles?.valor || 0).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Usos Disponibles:</span>
                                                        <span className="detail-value" style={{ 
                                                            fontWeight: 'bold', 
                                                            color: detalles?.usado ? '#d32f2f' : '#4CAF50' 
                                                        }}>
                                                            {detalles?.usos_disponibles || 0} de {detalles?.cantidad_usos || 1} usos
                                                            {detalles?.usado && ' (AGOTADO)'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Fecha de Expiración:</span>
                                                        <span className="detail-value">
                                                            {detalles?.fecha_expiracion ? new Date(detalles.fecha_expiracion).toLocaleDateString('es-PE', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Fecha de Pago:</span>
                                                        <span className="detail-value">
                                                            {detalles?.pago?.fecha_pago ? new Date(detalles.pago.fecha_pago).toLocaleDateString('es-PE', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Método de Pago:</span>
                                                        <span className="detail-value">{detalles?.pago?.metodoPago?.nombre || 'N/A'}</span>
                                                    </div>
                                                    {precio && (
                                                        <div className="detail-item highlight">
                                                            <span className="detail-label">Monto Pagado:</span>
                                                            <span className="detail-value precio">S/ {parseFloat(precio).toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Información de la boleta */}
                                        <div className="detail-section">
                                            <h4>📄 Información de la Boleta</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">Código QR:</span>
                                                    <span className="detail-value codigo">{datosQR.codigo || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Fecha de Emisión:</span>
                                                    <span className="detail-value">
                                                        {new Date(boleta.fecha_emision).toLocaleString('es-PE')}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Estado Actual:</span>
                                                    <span className={`estado-badge ${boleta.estado}`}>
                                                        {boleta.estado === 'activa' ? '✓ Activa' : 
                                                         boleta.estado === 'utilizada' ? '✓ Utilizada' : 
                                                         '✗ Cancelada'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ServiciosCorporativosAdmin;

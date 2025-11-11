import React, { useState, useEffect } from 'react';
import { getOrdenesUsuario, obtenerTodasBoletasCorporativas, getSedes, getPeliculas, getMetodosPago } from '../../services/api';
import { Form, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/ReportesAdmin.css';

function ReportesAdmin() {
    // Estados para filtros
    const [periodo, setPeriodo] = useState('semana');
    const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState('todas');
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('todos');
    const [tipoServicio, setTipoServicio] = useState('todos');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [modoFechaPersonalizada, setModoFechaPersonalizada] = useState(false);
    
    // Estados para datos
    const [sedes, setSedes] = useState([]);
    const [peliculas, setPeliculas] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    
    const [reportes, setReportes] = useState({
        ventasTotal: 0,
        ticketsVendidos: 0,
        combosVendidos: 0,
        ingresosPorDia: [],
        peliculasPopulares: [],
        metodoPagoMasUsado: null,
        // Servicios Corporativos
        serviciosCorporativos: 0,
        ingresosCorporativos: 0,
        funcionesPrivadas: 0,
        alquilerSalas: 0,
        publicidades: 0,
        valesCorporativos: 0,
        // Comparativa
        comparativaPeriodoAnterior: null
    });
    const [loading, setLoading] = useState(true);

    // Cargar datos iniciales (sedes, películas, métodos de pago)
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Recargar reportes cuando cambien los filtros
    useEffect(() => {
        cargarReportes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo, sedeSeleccionada, peliculaSeleccionada, metodoPagoSeleccionado, tipoServicio, fechaInicio, fechaFin]);

    const cargarDatosIniciales = async () => {
        try {
            const [sedesData, peliculasData, metodosData] = await Promise.all([
                getSedes(),
                getPeliculas(),
                getMetodosPago()
            ]);
            
            setSedes(sedesData || []);
            setPeliculas(peliculasData || []);
            setMetodosPago(metodosData || []);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    };

    const cargarReportes = async () => {
        try {
            setLoading(true);
            
            // Calcular fechas según el período o usar fechas personalizadas
            let fechaFinCalc = new Date();
            let fechaInicioCalc = new Date();
            
            if (modoFechaPersonalizada && fechaInicio && fechaFin) {
                fechaInicioCalc = new Date(fechaInicio);
                fechaFinCalc = new Date(fechaFin);
            } else {
                if (periodo === 'semana') {
                    fechaInicioCalc.setDate(fechaInicioCalc.getDate() - 7);
                } else if (periodo === 'mes') {
                    fechaInicioCalc.setMonth(fechaInicioCalc.getMonth() - 1);
                } else if (periodo === 'año') {
                    fechaInicioCalc.setFullYear(fechaInicioCalc.getFullYear() - 1);
                }
            }

            // Calcular período anterior para comparativa
            const duracionPeriodo = fechaFinCalc - fechaInicioCalc;
            const fechaInicioAnterior = new Date(fechaInicioCalc.getTime() - duracionPeriodo);
            const fechaFinAnterior = new Date(fechaInicioCalc.getTime());

            // Obtener todas las órdenes (admin puede ver todas)
            const todasOrdenes = await getOrdenesUsuario();
            
            console.log('📊 ===== FILTROS ACTIVOS =====');
            console.log('📅 Período:', periodo);
            console.log('🏢 Sede:', sedeSeleccionada);
            console.log('🎬 Película:', peliculaSeleccionada);
            console.log('💳 Método Pago:', metodoPagoSeleccionado);
            console.log('🎯 Tipo Servicio:', tipoServicio);
            console.log('📆 Fecha Personalizada:', modoFechaPersonalizada);
            console.log('📊 Total órdenes recibidas:', todasOrdenes.length);
            console.log('📊 ===========================');

            // FILTRAR ÓRDENES
            let ordenes = todasOrdenes.filter(orden => {
                const fechaOrden = new Date(orden.fecha_compra);
                let cumpleFiltros = fechaOrden >= fechaInicioCalc && fechaOrden <= fechaFinCalc;
                
                // Filtro por sede
                if (sedeSeleccionada !== 'todas' && orden.funcion?.sala?.sede?.id) {
                    const idSede = orden.funcion.sala.sede.id.toString();
                    console.log(`🔍 Comparando sede: ${idSede} === ${sedeSeleccionada}`, idSede === sedeSeleccionada);
                    cumpleFiltros = cumpleFiltros && idSede === sedeSeleccionada;
                }
                
                // Filtro por película
                if (peliculaSeleccionada !== 'todas' && orden.funcion?.pelicula?.id) {
                    const idPelicula = orden.funcion.pelicula.id.toString();
                    console.log(`🔍 Comparando película: ${idPelicula} === ${peliculaSeleccionada}`, idPelicula === peliculaSeleccionada);
                    cumpleFiltros = cumpleFiltros && idPelicula === peliculaSeleccionada;
                }
                
                // Filtro por método de pago
                if (metodoPagoSeleccionado !== 'todos' && orden.pago?.metodoPago?.id) {
                    const idMetodo = orden.pago.metodoPago.id.toString();
                    console.log(`🔍 Comparando método pago: ${idMetodo} === ${metodoPagoSeleccionado}`, idMetodo === metodoPagoSeleccionado);
                    cumpleFiltros = cumpleFiltros && idMetodo === metodoPagoSeleccionado;
                }
                
                // Filtro por tipo de servicio (tickets/combos)
                if (tipoServicio === 'tickets') {
                    const tieneTickets = orden.ordenTickets && orden.ordenTickets.length > 0;
                    console.log(`🔍 Verificando si tiene tickets:`, tieneTickets);
                    cumpleFiltros = cumpleFiltros && tieneTickets;
                } else if (tipoServicio === 'combos') {
                    const tieneCombos = orden.ordenCombos && orden.ordenCombos.length > 0;
                    console.log(`🔍 Verificando si tiene combos:`, tieneCombos);
                    cumpleFiltros = cumpleFiltros && tieneCombos;
                } else if (tipoServicio === 'corporativos') {
                    // Excluir órdenes normales cuando se filtran corporativos
                    return false;
                }
                
                return cumpleFiltros;
            });

            // Obtener órdenes del período anterior para comparativa
            const ordenesAnterior = todasOrdenes.filter(orden => {
                const fechaOrden = new Date(orden.fecha_compra);
                return fechaOrden >= fechaInicioAnterior && fechaOrden <= fechaFinAnterior;
            });

            console.log('✅ Órdenes filtradas:', ordenes.length, 'de', todasOrdenes.length);
            console.log('📊 Órdenes filtradas:', ordenes);

            // Obtener todas las boletas corporativas (admin)
            const todasBoletas = await obtenerTodasBoletasCorporativas();
            console.log('🎫 Boletas corporativas recibidas:', todasBoletas);

            // FILTRAR BOLETAS CORPORATIVAS
            let boletasCorporativas = todasBoletas.filter(boleta => {
                const fechaBoleta = new Date(boleta.fecha_emision);
                let cumpleFiltros = fechaBoleta >= fechaInicioCalc && fechaBoleta <= fechaFinCalc;
                
                // Filtro por sede (si aplica según el tipo de servicio)
                if (sedeSeleccionada !== 'todas' && boleta.detalles?.id_sede) {
                    cumpleFiltros = cumpleFiltros && boleta.detalles.id_sede.toString() === sedeSeleccionada;
                }
                
                // Filtro por tipo de servicio corporativo
                if (tipoServicio === 'corporativos') {
                    // Solo servicios corporativos
                    cumpleFiltros = cumpleFiltros && true;
                } else if (tipoServicio !== 'todos') {
                    // Si se seleccionó tickets o combos, excluir corporativos
                    return false;
                }
                
                return cumpleFiltros;
            });

            const boletasAnterior = todasBoletas.filter(boleta => {
                const fechaBoleta = new Date(boleta.fecha_emision);
                return fechaBoleta >= fechaInicioAnterior && fechaBoleta <= fechaFinAnterior;
            });

            console.log('🎫 Boletas filtradas por período:', boletasCorporativas);

            // Calcular estadísticas
            let ventasTotal = 0;
            let ticketsVendidos = 0;
            let combosVendidos = 0;
            
            ordenes.forEach(orden => {
                // Sumar total del pago
                if (orden.pago && orden.pago.monto_total) {
                    ventasTotal += parseFloat(orden.pago.monto_total);
                }
                
                // Contar tickets
                if (orden.ordenTickets && Array.isArray(orden.ordenTickets)) {
                    orden.ordenTickets.forEach(ot => {
                        ticketsVendidos += parseInt(ot.cantidad) || 0;
                    });
                }
                
                // Contar combos
                if (orden.ordenCombos && Array.isArray(orden.ordenCombos)) {
                    orden.ordenCombos.forEach(oc => {
                        combosVendidos += parseInt(oc.cantidad) || 0;
                    });
                }
            });

            // Ventas por película
            const ventasPorPelicula = {};
            ordenes.forEach(orden => {
                if (orden.funcion && orden.funcion.pelicula) {
                    const titulo = orden.funcion.pelicula.titulo || 'Sin título';
                    const montoOrden = orden.pago ? parseFloat(orden.pago.monto_total) : 0;
                    
                    if (!ventasPorPelicula[titulo]) {
                        ventasPorPelicula[titulo] = 0;
                    }
                    ventasPorPelicula[titulo] += montoOrden;
                }
            });

            const peliculasPopulares = Object.entries(ventasPorPelicula)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([titulo, ventas]) => ({ titulo, ventas }));

            // Método de pago más usado
            const metodosPago = {};
            ordenes.forEach(orden => {
                if (orden.pago && orden.pago.metodoPago) {
                    const metodo = orden.pago.metodoPago.nombre || 'Sin definir';
                    metodosPago[metodo] = (metodosPago[metodo] || 0) + 1;
                }
            });

            const metodoPagoMasUsado = Object.entries(metodosPago)
                .sort((a, b) => b[1] - a[1])[0];

            // ==========================================
            // ESTADÍSTICAS DE SERVICIOS CORPORATIVOS
            // ==========================================
            let ingresosCorporativos = 0;
            let funcionesPrivadas = 0;
            let alquilerSalas = 0;
            let publicidades = 0;
            let valesCorporativos = 0;

            boletasCorporativas.forEach(boleta => {
                // Contar por tipo
                if (boleta.tipo === 'funcion_privada') {
                    funcionesPrivadas++;
                    // Sumar precio_corporativo de funciones privadas
                    if (boleta.detalles && boleta.detalles.precio_corporativo) {
                        ingresosCorporativos += parseFloat(boleta.detalles.precio_corporativo);
                    }
                } else if (boleta.tipo === 'alquiler_sala') {
                    alquilerSalas++;
                    // Sumar precio de alquiler de salas
                    if (boleta.detalles && boleta.detalles.precio) {
                        ingresosCorporativos += parseFloat(boleta.detalles.precio);
                    }
                } else if (boleta.tipo === 'publicidad') {
                    publicidades++;
                    // Sumar precio de publicidad
                    if (boleta.detalles && boleta.detalles.precio) {
                        ingresosCorporativos += parseFloat(boleta.detalles.precio);
                    }
                } else if (boleta.tipo === 'vales_corporativos') {
                    valesCorporativos++;
                    // Sumar valor de vales
                    if (boleta.detalles && boleta.detalles.valor) {
                        ingresosCorporativos += parseFloat(boleta.detalles.valor);
                    }
                }
            });

            const serviciosCorporativos = boletasCorporativas.length;

            // ==========================================
            // CALCULAR COMPARATIVA CON PERÍODO ANTERIOR
            // ==========================================
            let ventasTotalAnterior = 0;
            ordenesAnterior.forEach(orden => {
                if (orden.pago && orden.pago.monto_total) {
                    ventasTotalAnterior += parseFloat(orden.pago.monto_total);
                }
            });

            let ingresosCorporativosAnterior = 0;
            boletasAnterior.forEach(boleta => {
                if (boleta.tipo === 'funcion_privada' && boleta.detalles?.precio_corporativo) {
                    ingresosCorporativosAnterior += parseFloat(boleta.detalles.precio_corporativo);
                } else if (boleta.detalles?.precio) {
                    ingresosCorporativosAnterior += parseFloat(boleta.detalles.precio);
                } else if (boleta.detalles?.valor) {
                    ingresosCorporativosAnterior += parseFloat(boleta.detalles.valor);
                }
            });

            const totalAnterior = ventasTotalAnterior + ingresosCorporativosAnterior;
            const totalActual = ventasTotal + ingresosCorporativos;
            const crecimiento = totalAnterior > 0 
                ? ((totalActual - totalAnterior) / totalAnterior * 100).toFixed(2)
                : 0;

            console.log('📊 Estadísticas calculadas:', {
                ventasTotal,
                ticketsVendidos,
                combosVendidos,
                peliculasPopulares,
                metodoPagoMasUsado,
                serviciosCorporativos,
                ingresosCorporativos,
                funcionesPrivadas,
                alquilerSalas,
                publicidades,
                valesCorporativos,
                comparativa: {
                    totalAnterior,
                    totalActual,
                    crecimiento
                }
            });

            setReportes({
                ventasTotal,
                ticketsVendidos,
                combosVendidos,
                peliculasPopulares,
                metodoPagoMasUsado: metodoPagoMasUsado ? {
                    nombre: metodoPagoMasUsado[0],
                    cantidad: metodoPagoMasUsado[1]
                } : null,
                serviciosCorporativos,
                ingresosCorporativos,
                funcionesPrivadas,
                alquilerSalas,
                publicidades,
                valesCorporativos,
                comparativaPeriodoAnterior: {
                    totalAnterior,
                    totalActual,
                    crecimiento
                }
            });

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            alert('Error al cargar reportes. Verifica la consola.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="reportes-admin">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-white">Cargando reportes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reportes-admin">
            <div className="section-header mb-4">
                <h2>📊 Reportes de Ventas</h2>
            </div>

            {/* PANEL DE FILTROS */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">🔍 Filtros Avanzados</h5>
                    
                    <Row className="g-3">
                        {/* Filtro 1: Período */}
                        <Col md={4}>
                            <Form.Label><strong>📅 Período</strong></Form.Label>
                            <Form.Select 
                                value={periodo} 
                                onChange={(e) => {
                                    setPeriodo(e.target.value);
                                    setModoFechaPersonalizada(false);
                                }}
                                disabled={modoFechaPersonalizada}
                            >
                                <option value="semana">Última Semana</option>
                                <option value="mes">Último Mes</option>
                                <option value="año">Último Año</option>
                            </Form.Select>
                        </Col>

                        {/* Filtro 2: Sede */}
                        <Col md={4}>
                            <Form.Label><strong>🏢 Sede</strong></Form.Label>
                            <Form.Select 
                                value={sedeSeleccionada} 
                                onChange={(e) => setSedeSeleccionada(e.target.value)}
                            >
                                <option value="todas">Todas las Sedes</option>
                                {sedes.map(sede => (
                                    <option key={sede.id} value={sede.id}>
                                        {sede.nombre} - {sede.ciudad}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Filtro 3: Película */}
                        <Col md={4}>
                            <Form.Label><strong>🎬 Película</strong></Form.Label>
                            <Form.Select 
                                value={peliculaSeleccionada} 
                                onChange={(e) => setPeliculaSeleccionada(e.target.value)}
                            >
                                <option value="todas">Todas las Películas</option>
                                {peliculas.map(pelicula => (
                                    <option key={pelicula.id} value={pelicula.id}>
                                        {pelicula.titulo}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Filtro 4: Método de Pago */}
                        <Col md={4}>
                            <Form.Label><strong>💳 Método de Pago</strong></Form.Label>
                            <Form.Select 
                                value={metodoPagoSeleccionado} 
                                onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                            >
                                <option value="todos">Todos los Métodos</option>
                                {metodosPago.map(metodo => (
                                    <option key={metodo.id} value={metodo.id}>
                                        {metodo.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Filtro 5: Tipo de Servicio */}
                        <Col md={4}>
                            <Form.Label><strong>🎯 Tipo de Servicio</strong></Form.Label>
                            <Form.Select 
                                value={tipoServicio} 
                                onChange={(e) => setTipoServicio(e.target.value)}
                            >
                                <option value="todos">Todos los Servicios</option>
                                <option value="tickets">Solo Tickets</option>
                                <option value="combos">Solo Combos</option>
                                <option value="corporativos">Solo Servicios Corporativos</option>
                            </Form.Select>
                        </Col>

                        {/* Filtro 6: Fechas Personalizadas */}
                        <Col md={4}>
                            <Form.Label><strong>📆 Rango Personalizado</strong></Form.Label>
                            <Form.Check 
                                type="switch"
                                id="fecha-personalizada-switch"
                                label={modoFechaPersonalizada ? "Activado" : "Desactivado"}
                                checked={modoFechaPersonalizada}
                                onChange={(e) => setModoFechaPersonalizada(e.target.checked)}
                            />
                        </Col>

                        {modoFechaPersonalizada && (
                            <>
                                <Col md={4}>
                                    <Form.Label><strong>Fecha Inicio</strong></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Label><strong>Fecha Fin</strong></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                    />
                                </Col>
                            </>
                        )}
                    </Row>

                    {/* Botón para limpiar filtros */}
                    <Row className="mt-3">
                        <Col>
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => {
                                    setPeriodo('semana');
                                    setSedeSeleccionada('todas');
                                    setPeliculaSeleccionada('todas');
                                    setMetodoPagoSeleccionado('todos');
                                    setTipoServicio('todos');
                                    setFechaInicio('');
                                    setFechaFin('');
                                    setModoFechaPersonalizada(false);
                                }}
                            >
                                🔄 Limpiar Filtros
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* COMPARATIVA DE PERÍODOS */}
            {reportes.comparativaPeriodoAnterior && (
                <Card className="mb-4 shadow-sm" style={{ 
                    background: parseFloat(reportes.comparativaPeriodoAnterior.crecimiento) >= 0 
                        ? 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)' 
                        : 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)'
                }}>
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h5 className="mb-2">
                                    📈 Comparativa con Período Anterior
                                </h5>
                                <p className="mb-0 text-muted">
                                    Período Anterior: <strong>S/ {reportes.comparativaPeriodoAnterior.totalAnterior.toFixed(2)}</strong>
                                    {' '} | {' '}
                                    Período Actual: <strong>S/ {reportes.comparativaPeriodoAnterior.totalActual.toFixed(2)}</strong>
                                </p>
                            </Col>
                            <Col md={4} className="text-end">
                                <Badge 
                                    bg={parseFloat(reportes.comparativaPeriodoAnterior.crecimiento) >= 0 ? 'success' : 'danger'}
                                    style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
                                >
                                    {parseFloat(reportes.comparativaPeriodoAnterior.crecimiento) >= 0 ? '📈' : '📉'} 
                                    {' '}
                                    {reportes.comparativaPeriodoAnterior.crecimiento}%
                                </Badge>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Ventas Totales (Tickets + Combos)</h3>
                        <p className="stat-value">S/ {reportes.ventasTotal.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎫</div>
                    <div className="stat-info">
                        <h3>Tickets Vendidos</h3>
                        <p className="stat-value">{reportes.ticketsVendidos}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🍿</div>
                    <div className="stat-info">
                        <h3>Combos Vendidos</h3>
                        <p className="stat-value">{reportes.combosVendidos}</p>
                    </div>
                </div>

                {reportes.metodoPagoMasUsado && (
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-info">
                            <h3>Método Más Usado</h3>
                            <p className="stat-value">{reportes.metodoPagoMasUsado.nombre}</p>
                            <p className="stat-detail">{reportes.metodoPagoMasUsado.cantidad} transacciones</p>
                        </div>
                    </div>
                )}
            </div>

            {/* NUEVA SECCIÓN: Servicios Corporativos */}
            <div className="section-divider">
                <h3>🏢 Servicios Corporativos</h3>
            </div>

            <div className="stats-grid">
                <div className="stat-card corporate">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>Ingresos Corporativos</h3>
                        <p className="stat-value">S/ {reportes.ingresosCorporativos.toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-card corporate">
                    <div className="stat-icon">🎬</div>
                    <div className="stat-info">
                        <h3>Funciones Privadas</h3>
                        <p className="stat-value">{reportes.funcionesPrivadas}</p>
                        <p className="stat-detail">eventos reservados</p>
                    </div>
                </div>

                <div className="stat-card corporate">
                    <div className="stat-icon">🎪</div>
                    <div className="stat-info">
                        <h3>Alquiler de Salas</h3>
                        <p className="stat-value">{reportes.alquilerSalas}</p>
                        <p className="stat-detail">salas alquiladas</p>
                    </div>
                </div>

                <div className="stat-card corporate">
                    <div className="stat-icon">📺</div>
                    <div className="stat-info">
                        <h3>Publicidad</h3>
                        <p className="stat-value">{reportes.publicidades || 0}</p>
                        <p className="stat-detail">campañas activas</p>
                    </div>
                </div>

                <div className="stat-card corporate">
                    <div className="stat-icon">🎫</div>
                    <div className="stat-info">
                        <h3>Vales Corporativos</h3>
                        <p className="stat-value">{reportes.valesCorporativos || 0}</p>
                        <p className="stat-detail">vales emitidos</p>
                    </div>
                </div>

                <div className="stat-card corporate">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>Total Servicios</h3>
                        <p className="stat-value">{reportes.serviciosCorporativos}</p>
                        <p className="stat-detail">boletas emitidas</p>
                    </div>
                </div>
            </div>

            {/* RESUMEN GENERAL */}
            <div className="section-divider">
                <h3>💎 Resumen General</h3>
            </div>

            <div className="stats-grid">
                <div className="stat-card total-summary">
                    <div className="stat-icon">💵</div>
                    <div className="stat-info">
                        <h3>Ingresos Totales</h3>
                        <p className="stat-value total">
                            S/ {(reportes.ventasTotal + reportes.ingresosCorporativos).toFixed(2)}
                        </p>
                        <p className="stat-detail">
                            Tickets: S/ {reportes.ventasTotal.toFixed(2)} + 
                            Corporativo: S/ {reportes.ingresosCorporativos.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <h3>🎬 Películas Más Populares</h3>
                {reportes.peliculasPopulares.length > 0 ? (
                    <div className="movies-chart">
                        {reportes.peliculasPopulares.map((pelicula, index) => (
                            <div key={index} className="movie-bar">
                                <span className="movie-rank">{index + 1}</span>
                                <span className="movie-title">{pelicula.titulo}</span>
                                <div className="movie-bar-container">
                                    <div 
                                        className="movie-bar-fill" 
                                        style={{ 
                                            width: `${(pelicula.ventas / reportes.peliculasPopulares[0].ventas) * 100}%` 
                                        }}
                                    />
                                </div>
                                <span className="movie-revenue">S/ {pelicula.ventas.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No hay datos de películas en este período</p>
                )}
            </div>
        </div>
    );
}

export default ReportesAdmin;

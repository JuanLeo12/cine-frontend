import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrdenesUsuario, obtenerMisBoletas } from '../../services/api';
import QRCode from 'react-qr-code';
import './css/MisCompras.css';

function MisCompras() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [boletasCorporativas, setBoletasCorporativas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordenExpandida, setOrdenExpandida] = useState(null);
    const [boletaExpandida, setBoletaExpandida] = useState(null);
    const [vistaActiva, setVistaActiva] = useState('tickets'); // 'tickets' o 'corporativo'

    const cargarCompras = useCallback(async () => {
        try {
            // Cargar tickets regulares
            const dataOrdenes = await getOrdenesUsuario();
            console.log('🛒 Órdenes recibidas:', dataOrdenes);
            console.log('👤 Usuario actual (del contexto):', user);
            console.log('📊 Detalle de órdenes:', dataOrdenes.map(o => ({
                id: o.id,
                id_usuario: o.id_usuario,
                usuario_nombre: o.usuario?.nombre,
                estado: o.estado
            })));
            
            // 🔒 FILTRO DE SEGURIDAD ADICIONAL: Solo mostrar órdenes del usuario actual
            const ordenesPropias = dataOrdenes.filter(orden => orden.id_usuario === user?.id);
            console.log('🔒 Órdenes filtradas por seguridad (solo del usuario):', ordenesPropias.length);
            
            // Cargar boletas corporativas primero (solo si es corporativo o cliente)
            let idsOrdenesConBoleta = [];
            if (user?.rol === 'corporativo' || user?.rol === 'cliente') {
                try {
                    const dataBoletas = await obtenerMisBoletas();
                    console.log('🎬 Boletas corporativas recibidas:', dataBoletas);
                    console.log('📊 Cantidad de boletas:', dataBoletas?.length || 0);
                    
                    if (dataBoletas && dataBoletas.length > 0) {
                        dataBoletas.forEach((boleta, index) => {
                            console.log(`📋 Boleta ${index + 1}:`, {
                                id: boleta.id,
                                tipo: boleta.tipo,
                                estado: boleta.estado,
                                tiene_vales: boleta.vales ? `Sí (${boleta.vales.length})` : 'No',
                                tiene_detalles: !!boleta.detalles,
                                id_pago_orden: boleta.id_pago_orden,
                                id_orden_compra: boleta.detalles?.id_orden_compra
                            });
                            
                            // Log detallado para vales corporativos
                            if (boleta.tipo === 'vales_corporativos') {
                                console.log(`🎟️ DETALLES DE VALE:`, {
                                    id_boleta: boleta.id,
                                    vales: boleta.vales,
                                    detalles: boleta.detalles,
                                    codigo_qr: boleta.codigo_qr?.substring(0, 50) + '...',
                                    id_pago: boleta.detalles?.id_pago,
                                    fecha_compra: boleta.detalles?.fecha_compra,
                                    monto_total: boleta.detalles?.monto_total
                                });
                            }
                            
                            // Obtener el id de orden asociado a esta boleta
                            // Para vales: usar id_pago_orden o detalles.id_orden_compra
                            // Para otros servicios: pueden tener id_pago_orden si hay pago asociado
                            const idOrdenAsociada = boleta.id_pago_orden || boleta.detalles?.id_orden_compra;
                            if (idOrdenAsociada) {
                                idsOrdenesConBoleta.push(idOrdenAsociada);
                                console.log(`  ✅ Orden ${idOrdenAsociada} marcada para exclusión (tiene boleta ${boleta.tipo})`);
                            }
                        });
                    }
                    
                    console.log('🚫 IDs de órdenes a excluir de Tickets:', idsOrdenesConBoleta);
                    
                    setBoletasCorporativas(dataBoletas || []);
                } catch (error) {
                    console.error('❌ Error al cargar boletas corporativas:', error);
                    setBoletasCorporativas([]);
                }
            }
            
            // Filtrar órdenes: solo mostrar las que están pagadas O las pendientes que tienen contenido
            // EXCLUIR órdenes que ya tienen boleta corporativa para evitar duplicación
            const ordenesFiltradas = ordenesPropias.filter(orden => {
                // 🚫 EXCLUIR órdenes que tienen boleta corporativa asociada
                if (idsOrdenesConBoleta.includes(orden.id)) {
                    console.log(`🚫 Orden ${orden.id} excluida: tiene boleta corporativa asociada`);
                    return false;
                }
                
                // Mostrar si está pagada
                if (orden.estado === 'pagada') return true;
                
                // Si está pendiente, solo mostrar si tiene tickets O combos
                if (orden.estado === 'pendiente') {
                    const tieneTickets = orden.ordenTickets && orden.ordenTickets.length > 0;
                    const tieneCombos = orden.ordenCombos && orden.ordenCombos.length > 0;
                    return tieneTickets || tieneCombos;
                }
                
                // No mostrar canceladas ni otras
                return false;
            });
            
            console.log('✅ Órdenes filtradas (mostradas):', ordenesFiltradas.length);
            setOrdenes(ordenesFiltradas);
        } catch (error) {
            console.error('Error al cargar compras:', error);
        } finally {
            setLoading(false);
        }
    }, [user]); // Incluir user completo en dependencias

    useEffect(() => {
        cargarCompras();
    }, [cargarCompras]);

    // Cambiar vista por defecto si no hay tickets pero sí hay servicios corporativos
    useEffect(() => {
        if (!loading && ordenes.length === 0 && boletasCorporativas.length > 0) {
            setVistaActiva('corporativo');
        }
    }, [loading, ordenes.length, boletasCorporativas.length]);

    const calcularTotal = (orden) => {
        // Si tiene monto_total guardado, usarlo (ya incluye descuentos)
        if (orden.monto_total && orden.monto_total > 0) {
            return Number(orden.monto_total);
        }

        // Si no, calcular desde tickets y combos CON descuentos
        let total = 0;

        // Sumar tickets (con descuento si aplica)
        if (orden.ordenTickets && orden.ordenTickets.length > 0) {
            orden.ordenTickets.forEach(ot => {
                const subtotal = Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1);
                const descuento = Number(ot.descuento || 0);
                total += subtotal - descuento;
            });
        }

        // Sumar combos (con descuento si aplica)
        if (orden.ordenCombos && orden.ordenCombos.length > 0) {
            orden.ordenCombos.forEach(oc => {
                const subtotal = Number(oc.precio_unitario || 0) * Number(oc.cantidad || 0);
                const descuento = Number(oc.descuento || 0);
                total += subtotal - descuento;
            });
        }

        return total;
    };

    const toggleOrden = (ordenId) => {
        setOrdenExpandida(ordenExpandida === ordenId ? null : ordenId);
    };

    const generarQR = (orden) => {
        // Construir información completa para el QR en formato JSON
        const pelicula = orden.funcion?.pelicula?.titulo || 'N/A';
        const fecha = orden.funcion?.fecha || 'N/A';
        const hora = orden.funcion?.hora || 'N/A';
        const sala = orden.funcion?.sala?.nombre || 'N/A';
        const sede = orden.funcion?.sala?.sede?.nombre || 'N/A';
        
        // Obtener asientos
        const asientos = [];
        if (orden.ordenTickets) {
            orden.ordenTickets.forEach(ot => {
                if (ot.tickets) {
                    ot.tickets.forEach(ticket => {
                        if (ticket.asientoFuncion) {
                            asientos.push(`${ticket.asientoFuncion.fila}${ticket.asientoFuncion.numero}`);
                        }
                    });
                }
            });
        }

        // Obtener tickets con tipo y cantidad
        const tickets = [];
        if (orden.ordenTickets) {
            orden.ordenTickets.forEach(ot => {
                const nombreTipo = ot.tipoTicket?.nombre || 'Ticket';
                const cantidad = ot.cantidad;
                tickets.push({
                    tipo: nombreTipo,
                    cantidad: cantidad,
                    descripcion: `x${cantidad} Ticket${cantidad > 1 ? 's' : ''} ${nombreTipo}`
                });
            });
        }
        
        const total = calcularTotal(orden);
        
        // Crear objeto JSON con toda la información
        // Incluir combos y formatear fecha de compra a zona Perú
        const combos = (orden.ordenCombos || []).map(oc => ({ nombre: oc.combo?.nombre || 'N/A', cantidad: oc.cantidad }));
        const fechaCompraFormateada = orden.fecha_compra ? new Date(orden.fecha_compra).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : 'N/A';

        // Calcular descuento total
        let descuentoTotal = 0;
        (orden.ordenTickets || []).forEach(ot => {
            descuentoTotal += Number(ot.descuento || 0) * Number(ot.cantidad || 1);
        });
        (orden.ordenCombos || []).forEach(oc => {
            descuentoTotal += Number(oc.descuento || 0) * Number(oc.cantidad || 0);
        });

        const qrData = {
            tipo: "CINESTAR_TICKET",
            orden_id: orden.id,
            pelicula: pelicula,
            funcion: {
                fecha: fecha,
                hora: hora
            },
            ubicacion: {
                sede: sede,
                sala: sala
            },
            asientos: asientos,
            tickets: tickets, // ← Información de tipos de tickets
            combos: combos,
            pago: {
                total: parseFloat(total.toFixed(2)),
                descuento: descuentoTotal > 0 ? parseFloat(descuentoTotal.toFixed(2)) : 0,
                estado: orden.pago?.estado_pago || 'pendiente',
                metodo: orden.pago?.metodoPago?.nombre || 'N/A'
            },
            fecha_compra: fechaCompraFormateada,
            cliente: orden.usuario?.nombre || 'N/A'
        };
        
        // Convertir a JSON con formato legible (indentación de 2 espacios)
        const jsonData = JSON.stringify(qrData, null, 2);
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(jsonData)}`;
    };

        const printOrden = (orden) => {
                const urlQR = generarQR(orden);
                const total = calcularTotal(orden);
                const fechaFormateada = new Date(orden.fecha_compra).toLocaleString('es-PE', { 
                    timeZone: 'America/Lima',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Construir HTML del comprobante completo
                let ticketsHTML = '';
                if (orden.ordenTickets && orden.ordenTickets.length > 0) {
                    ticketsHTML = `
                        <div class="section">
                            <h3>🎫 Tickets Comprados</h3>
                            <div class="items-list">
                                ${orden.ordenTickets.map(ot => {
                                    const nombreTipo = ot.tipoTicket?.nombre || 'Ticket';
                                    const cantidad = ot.cantidad;
                                    const precio = Number(ot.precio_unitario || 0);
                                    const subtotal = precio * cantidad;
                                    return `
                                        <div class="item">
                                            <span class="item-desc">• x${cantidad} Ticket${cantidad > 1 ? 's' : ''} ${nombreTipo}</span>
                                            <span class="item-price">S/ ${subtotal.toFixed(2)}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

                let asientosHTML = '';
                if (orden.ordenTickets && orden.ordenTickets.length > 0) {
                    const todosAsientos = [];
                    orden.ordenTickets.forEach(ot => {
                        if (ot.tickets) {
                            ot.tickets.forEach(ticket => {
                                if (ticket.asientoFuncion) {
                                    todosAsientos.push(`${ticket.asientoFuncion.fila}${ticket.asientoFuncion.numero}`);
                                }
                            });
                        }
                    });

                    if (todosAsientos.length > 0) {
                        asientosHTML = `
                            <div class="section">
                                <h3>🪑 Asientos Asignados</h3>
                                <div class="asientos-container">
                                    ${todosAsientos.map(a => `<span class="asiento-badge">${a}</span>`).join('')}
                                </div>
                            </div>
                        `;
                    }
                }

                let combosHTML = '';
                if (orden.ordenCombos && orden.ordenCombos.length > 0) {
                    combosHTML = `
                        <div class="section">
                            <h3>🍿 Combos</h3>
                            <div class="items-list">
                                ${orden.ordenCombos.map(oc => {
                                    const nombre = oc.combo?.nombre || 'Combo';
                                    const cantidad = oc.cantidad;
                                    const precio = Number(oc.precio_unitario || 0);
                                    const subtotal = precio * cantidad;
                                    return `
                                        <div class="item">
                                            <span class="item-desc">• ${cantidad}x ${nombre}</span>
                                            <span class="item-price">S/ ${subtotal.toFixed(2)}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

                let funcionHTML = '';
                if (orden.funcion) {
                    const fechaFuncion = new Date(orden.funcion.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    funcionHTML = `
                        <div class="section">
                            <h3>🎬 Información de la Función</h3>
                            <div class="info-list">
                                <div class="info-row">
                                    <span class="label">Película:</span>
                                    <span class="value">${orden.funcion.pelicula?.titulo || 'N/A'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Fecha:</span>
                                    <span class="value">${fechaFuncion}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Hora:</span>
                                    <span class="value">${orden.funcion.hora}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Sede:</span>
                                    <span class="value">${orden.funcion.sala?.sede?.nombre || 'N/A'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Sala:</span>
                                    <span class="value">${orden.funcion.sala?.nombre || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }

                const html = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Comprobante Orden ${orden.id}</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            body { 
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                padding: 30px;
                                max-width: 800px;
                                margin: 0 auto;
                                background: white;
                                color: #333;
                            }
                            .header { 
                                text-align: center;
                                margin-bottom: 30px;
                                padding-bottom: 20px;
                                border-bottom: 3px solid #e60000;
                            }
                            .header h1 {
                                color: #e60000;
                                font-size: 2.5rem;
                                margin-bottom: 10px;
                            }
                            .header .orden-id {
                                font-size: 1.2rem;
                                color: #666;
                                font-weight: 600;
                            }
                            .section { 
                                margin: 25px 0;
                                padding: 20px;
                                background: #f9f9f9;
                                border-radius: 8px;
                                border-left: 4px solid #e60000;
                            }
                            .section h3 {
                                color: #e60000;
                                margin-bottom: 15px;
                                font-size: 1.3rem;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                            .qr-section {
                                text-align: center;
                                background: linear-gradient(135deg, #fff5f5, #ffe6e6);
                                border: 3px dashed #e60000;
                                padding: 25px;
                            }
                            .qr-section img {
                                max-width: 250px;
                                border: 4px solid #e60000;
                                border-radius: 10px;
                                padding: 10px;
                                background: white;
                            }
                            .cliente-info {
                                background: #f0f0f0;
                            }
                            .cliente-info p {
                                font-size: 1.1rem;
                                color: #333;
                                line-height: 1.6;
                            }
                            .info-list {
                                display: flex;
                                flex-direction: column;
                                gap: 10px;
                            }
                            .info-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #ddd;
                            }
                            .info-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: 600;
                                color: #666;
                            }
                            .value {
                                color: #333;
                                font-weight: 500;
                            }
                            .items-list {
                                display: flex;
                                flex-direction: column;
                                gap: 12px;
                            }
                            .item {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 10px 15px;
                                background: white;
                                border-radius: 6px;
                                border-left: 3px solid #ff9800;
                            }
                            .item-desc {
                                font-size: 1.05rem;
                                color: #333;
                                font-weight: 500;
                            }
                            .item-price {
                                font-size: 1.1rem;
                                font-weight: 700;
                                color: #1976d2;
                            }
                            .asientos-container {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                                padding: 10px;
                                background: white;
                                border-radius: 6px;
                            }
                            .asiento-badge {
                                background: #2196f3;
                                color: white;
                                padding: 8px 16px;
                                border-radius: 6px;
                                font-weight: bold;
                                font-size: 1rem;
                                box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
                            }
                            .total-section {
                                background: linear-gradient(135deg, #e60000, #c00000);
                                color: white;
                                padding: 25px;
                                border-radius: 8px;
                                margin-top: 30px;
                            }
                            .total-section h3 {
                                color: white;
                                border-bottom: 2px solid rgba(255,255,255,0.3);
                                padding-bottom: 15px;
                                margin-bottom: 15px;
                            }
                            .total-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                font-size: 1.1rem;
                            }
                            .total-final {
                                font-size: 2rem;
                                font-weight: bold;
                                padding-top: 15px;
                                border-top: 2px solid rgba(255,255,255,0.3);
                                margin-top: 10px;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 40px;
                                padding-top: 20px;
                                border-top: 2px solid #ddd;
                                color: #666;
                            }
                            .footer p {
                                margin: 5px 0;
                            }
                            .importante {
                                background: #fff3cd;
                                border-left: 4px solid #ff9800;
                                padding: 15px 20px;
                                margin: 20px 0;
                                border-radius: 6px;
                            }
                            .importante h4 {
                                color: #e65100;
                                margin-bottom: 10px;
                            }
                            .importante ul {
                                margin-left: 20px;
                                color: #856404;
                            }
                            .importante li {
                                margin: 8px 0;
                                line-height: 1.5;
                            }
                            @media print {
                                body {
                                    padding: 0;
                                }
                                .section {
                                    page-break-inside: avoid;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>🎬 CineStar</h1>
                            <p class="orden-id">Comprobante de Compra - Orden #${orden.id}</p>
                        </div>

                        <div class="section cliente-info">
                            <h3>👤 Cliente</h3>
                            <p><strong>Nombre:</strong> ${orden.usuario?.nombre || 'N/A'}</p>
                            <p><strong>Email:</strong> ${orden.usuario?.email || 'N/A'}</p>
                            <p><strong>Fecha de compra:</strong> ${fechaFormateada}</p>
                        </div>

                        ${funcionHTML}

                        ${ticketsHTML}

                        ${asientosHTML}

                        ${combosHTML}

                        <div class="total-section">
                            <h3>💰 Resumen de Pago</h3>
                            ${(() => {
                                // Calcular si hubo descuento
                                let subtotalOriginal = 0;
                                let descuentoTotal = 0;
                                let porcentajeDescuento = 0;
                                let tipoDescuento = '';
                                
                                // Tickets
                                if (orden.ordenTickets && orden.ordenTickets.length > 0) {
                                    orden.ordenTickets.forEach(ot => {
                                        const subtotal = Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1);
                                        const desc = Number(ot.descuento || 0);
                                        subtotalOriginal += subtotal;
                                        descuentoTotal += desc;
                                        
                                        if (desc > 0 && subtotal > 0) {
                                            porcentajeDescuento = (desc / subtotal) * 100;
                                            tipoDescuento = 'Tickets';
                                        }
                                    });
                                }
                                
                                // Combos
                                if (orden.ordenCombos && orden.ordenCombos.length > 0) {
                                    orden.ordenCombos.forEach(oc => {
                                        const subtotal = Number(oc.precio_unitario || 0) * Number(oc.cantidad || 0);
                                        const desc = Number(oc.descuento || 0);
                                        subtotalOriginal += subtotal;
                                        descuentoTotal += desc;
                                        
                                        if (desc > 0 && subtotal > 0 && !tipoDescuento) {
                                            porcentajeDescuento = (desc / subtotal) * 100;
                                            tipoDescuento = 'Combos';
                                        }
                                    });
                                }
                                
                                if (descuentoTotal > 0) {
                                    return `
                                        <div class="total-row">
                                            <span>Subtotal:</span>
                                            <span>S/ ${subtotalOriginal.toFixed(2)}</span>
                                        </div>
                                        <div class="total-row" style="color: #27ae60;">
                                            <span>💎 Descuento Vale (${porcentajeDescuento.toFixed(0)}% en ${tipoDescuento}):</span>
                                            <span>- S/ ${descuentoTotal.toFixed(2)}</span>
                                        </div>
                                    `;
                                }
                                return '';
                            })()}
                            <div class="total-row">
                                <span>Método de pago:</span>
                                <span>${orden.pago?.metodoPago?.nombre || 'N/A'}</span>
                            </div>
                            <div class="total-row">
                                <span>Estado:</span>
                                <span>${orden.pago?.estado_pago?.toUpperCase() || 'N/A'}</span>
                            </div>
                            <div class="total-row total-final">
                                <span>TOTAL PAGADO:</span>
                                <span>S/ ${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="section qr-section">
                            <h3>📱 Código QR</h3>
                            <img src="${urlQR}" alt="QR Orden ${orden.id}" />
                            <p style="margin-top: 15px; color: #666; font-size: 0.95rem;">
                                <strong>Presenta este código al ingresar al cine</strong>
                            </p>
                        </div>

                        <div class="importante">
                            <h4>⚠️ Información Importante</h4>
                            <ul>
                                <li>Presenta este comprobante y el código QR al personal de CineStar</li>
                                <li>Llega 15 minutos antes de la función</li>
                                <li>Los asientos están confirmados y reservados</li>
                                <li>No se permiten devoluciones una vez realizada la compra</li>
                                <li>Este comprobante es válido únicamente para la función indicada</li>
                            </ul>
                        </div>

                        <div class="footer">
                            <p><strong>CineStar Perú</strong></p>
                            <p>www.cinestar.com.pe | info@cinestar.com.pe</p>
                            <p>Impreso el ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
                        </div>
                    </body>
                </html>`;

                const w = window.open('', '_blank');
                if (!w) return alert('Pop-up bloqueado. Permite ventanas emergentes para imprimir.');
                w.document.open();
                w.document.write(html);
                w.document.close();
                w.focus();
                setTimeout(() => { w.print(); w.close(); }, 500);
        };

    const toggleBoleta = (boletaId) => {
        setBoletaExpandida(boletaExpandida === boletaId ? null : boletaId);
    };

    const extraerDatosQR = (codigo_qr) => {
        try {
            const datos = JSON.parse(codigo_qr);
            return datos;
        } catch (e) {
            // Si no es JSON, es el código antiguo
            return { codigo: codigo_qr };
        }
    };

    const printBoletaCorporativa = (boleta) => {
        const datosQR = extraerDatosQR(boleta.codigo_qr);
        const detalles = boleta.detalles;
        const esValeCorporativo = boleta.tipo === 'vales_corporativos';
        
        // Crear un iframe oculto para imprimir
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow.document;
        
        const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Boleta Corporativa ${datosQR.codigo}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 30px;
                        background: white;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center;
                        border-bottom: 3px solid #1976d2;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #1976d2;
                        font-size: 32px;
                        margin-bottom: 5px;
                    }
                    .header .tipo-servicio {
                        font-size: 18px;
                        color: #666;
                        font-weight: 500;
                    }
                    .codigo-principal {
                        background: #e3f2fd;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        margin: 20px 0;
                        border-left: 4px solid #1976d2;
                    }
                    .codigo-principal .label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .codigo-principal .codigo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1976d2;
                        font-family: 'Courier New', monospace;
                    }
                    .section { 
                        margin: 25px 0;
                        page-break-inside: avoid;
                    }
                    .section h3 {
                        color: #1976d2;
                        border-bottom: 2px solid #e0e0e0;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                        font-size: 18px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-top: 15px;
                    }
                    .info-item {
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                    }
                    .info-item .label {
                        font-size: 11px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        display: block;
                        margin-bottom: 4px;
                    }
                    .info-item .value {
                        font-size: 15px;
                        font-weight: 600;
                        color: #333;
                    }
                    .qr-section {
                        text-align: center;
                        margin: 30px 0;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 12px;
                        page-break-inside: avoid;
                    }
                    .qr-section h3 {
                        margin-bottom: 15px;
                    }
                    .qr-container {
                        display: inline-block;
                        padding: 20px;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .precio-destacado {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 20px 0;
                        box-shadow: 0 4px 6px rgba(25, 118, 210, 0.2);
                    }
                    .precio-destacado .label {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 5px;
                    }
                    .precio-destacado .valor {
                        font-size: 36px;
                        font-weight: bold;
                    }
                    .estado-badge {
                        display: inline-block;
                        padding: 8px 20px;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .estado-badge.activa {
                        background: #4caf50;
                        color: white;
                    }
                    .estado-badge.utilizada {
                        background: #2196f3;
                        color: white;
                    }
                    .estado-badge.cancelada {
                        background: #f44336;
                        color: white;
                    }
                    .descripcion-evento {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        border-radius: 6px;
                        margin: 15px 0;
                    }
                    .descripcion-evento p {
                        margin: 5px 0;
                        color: #856404;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #e0e0e0;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .importante {
                        background: #fff8e1;
                        border-left: 4px solid #ff9800;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 6px;
                        page-break-inside: avoid;
                    }
                    .importante h4 {
                        color: #e65100;
                        margin-bottom: 10px;
                    }
                    .importante ul {
                        margin-left: 20px;
                        color: #666;
                    }
                    .importante li {
                        margin: 5px 0;
                    }
                    /* Estilos para Vales Corporativos */
                    .vales-container {
                        margin: 20px 0;
                    }
                    .vale-card {
                        background: white;
                        border: 2px solid #1976d2;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    .vale-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #e0e0e0;
                    }
                    .vale-tipo-badge {
                        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 14px;
                    }
                    .vale-estado-badge {
                        padding: 6px 14px;
                        border-radius: 15px;
                        font-weight: 600;
                        font-size: 12px;
                        text-transform: uppercase;
                    }
                    .vale-estado-badge.vigente {
                        background: #4caf50;
                        color: white;
                    }
                    .vale-estado-badge.usado {
                        background: #9e9e9e;
                        color: white;
                    }
                    .vale-codigo-principal {
                        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 15px 0;
                        border: 2px dashed #1976d2;
                    }
                    .vale-codigo-label {
                        font-size: 12px;
                        color: #1565c0;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    .vale-codigo-value {
                        font-size: 28px;
                        font-weight: bold;
                        color: #0d47a1;
                        font-family: 'Courier New', monospace;
                        letter-spacing: 2px;
                    }
                    .vale-details-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin: 20px 0;
                    }
                    .vale-detail {
                        background: #f8f9fa;
                        padding: 12px;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .vale-detail-label {
                        display: block;
                        font-size: 11px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 6px;
                    }
                    .vale-detail-value {
                        display: block;
                        font-size: 18px;
                        font-weight: bold;
                        color: #1976d2;
                    }
                    .vale-instrucciones {
                        background: #fff8e1;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        border-radius: 6px;
                        margin-top: 15px;
                    }
                    .vale-instrucciones strong {
                        color: #f57c00;
                        display: block;
                        margin-bottom: 8px;
                    }
                    .vale-instrucciones p {
                        margin: 5px 0;
                        color: #666;
                        font-size: 13px;
                    }
                    @page {
                        margin: 1.5cm;
                    }
                    @media print {
                        body { 
                            padding: 10px; 
                        }
                        .qr-section { 
                            background: white; 
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎬 CineStar</h1>
                    <p class="tipo-servicio">${
                        esValeCorporativo ? 'Vale Corporativo' : 
                        boleta.tipo === 'funcion_privada' ? 'Boleta de Función Privada' : 
                        boleta.tipo === 'alquiler_sala' ? 'Boleta de Alquiler de Sala' :
                        boleta.tipo === 'publicidad' ? 'Boleta de Publicidad' :
                        'Boleta de Servicio Corporativo'
                    }</p>
                </div>

                <div class="codigo-principal">
                    <div class="label">Código de Boleta</div>
                    <div class="codigo">${datosQR.codigo}</div>
                </div>

                ${esValeCorporativo && boleta.vales?.length > 0 ? `
                <div class="codigo-principal" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #1976d2;">
                    <div class="label">🎟️ Código del Vale</div>
                    <div class="codigo" style="color: #0d47a1; font-size: 28px;">${boleta.vales[0].codigo}</div>
                </div>
                ` : ''}

                <div class="section">
                    <h3>📋 Información del Servicio</h3>
                    
                    ${esValeCorporativo && boleta.vales?.length > 0 ? `
                    <!-- Información de Vales Corporativos -->
                    <div class="vales-container">
                        ${boleta.vales.map(vale => `
                        <div class="vale-card">
                            <div class="vale-header">
                                <span class="vale-tipo-badge">${vale.tipo === 'entrada' ? '🎫 Entrada' : '🍿 Combo'}</span>
                                <span class="vale-estado-badge ${vale.usado ? 'usado' : 'vigente'}">
                                    ${vale.usado ? 'Agotado' : 'Vigente'}
                                </span>
                            </div>
                            <div class="vale-codigo-principal">
                                <div class="vale-codigo-label">Código del Vale</div>
                                <div class="vale-codigo-value">${vale.codigo}</div>
                            </div>
                            <div class="vale-details-grid">
                                <div class="vale-detail">
                                    <span class="vale-detail-label">Descuento</span>
                                    <span class="vale-detail-value">${parseFloat(vale.valor).toFixed(0)}%</span>
                                </div>
                                <div class="vale-detail">
                                    <span class="vale-detail-label">Usos disponibles</span>
                                    <span class="vale-detail-value">${vale.usos_disponibles || 0} de ${vale.cantidad_usos || 1}</span>
                                </div>
                                <div class="vale-detail">
                                    <span class="vale-detail-label">Fecha de expiración</span>
                                    <span class="vale-detail-value">${new Date(vale.fecha_expiracion).toLocaleDateString('es-PE')}</span>
                                </div>
                            </div>
                            <div class="vale-instrucciones">
                                <strong>📝 Instrucciones de uso:</strong>
                                <p>• Presenta este código al momento de realizar tu compra</p>
                                <p>• Obtienes ${parseFloat(vale.valor).toFixed(0)}% de descuento en ${vale.tipo === 'entrada' ? 'entradas' : 'combos'}</p>
                                <p>• El vale tiene ${vale.cantidad_usos || 1} uso(s) disponible(s)</p>
                                <p>• Válido hasta la fecha de expiración indicada</p>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                    ` : `
                    <!-- Información de Función Privada o Alquiler -->
                    <div class="info-grid">
                        ${boleta.tipo === 'funcion_privada' ? `
                        <div class="info-item">
                            <span class="label">Película</span>
                            <span class="value">${detalles?.pelicula?.titulo || datosQR.servicio?.pelicula || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Duración</span>
                            <span class="value">3 horas (Función Privada)</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <span class="label">Sede</span>
                            <span class="value">${detalles?.sala?.sede?.nombre || datosQR.servicio?.sede || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Sala</span>
                            <span class="value">${detalles?.sala?.nombre || datosQR.servicio?.sala || 'N/A'} (${detalles?.sala?.tipo_sala || datosQR.servicio?.tipo_sala || 'N/A'})</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fecha del Evento</span>
                            <span class="value">${detalles?.fecha ? new Date(detalles.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : (datosQR.servicio?.fecha || 'N/A')}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Horario</span>
                            <span class="value">${detalles?.hora_inicio || datosQR.servicio?.hora_inicio || 'N/A'} - ${detalles?.hora_fin || datosQR.servicio?.hora_fin || 'N/A'}</span>
                        </div>
                    </div>

                    ${(detalles?.descripcion_evento || datosQR.servicio?.descripcion) ? `
                    <div class="descripcion-evento">
                        <strong>📝 Descripción del Evento:</strong>
                        <p>${detalles?.descripcion_evento || datosQR.servicio?.descripcion}</p>
                    </div>
                    ` : ''}
                    `}
                </div>

                ${detalles?.precio ? `
                <div class="precio-destacado">
                    <div class="label">PRECIO TOTAL</div>
                    <div class="valor">S/ ${parseFloat(detalles.precio).toFixed(2)}</div>
                </div>
                ` : ''}

                <div class="section">
                    <h3>📄 Estado de la Boleta</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Estado Actual</span>
                            <span class="estado-badge ${boleta.estado}">
                                ${boleta.estado === 'activa' ? '✓ Activa' : 
                                  boleta.estado === 'utilizada' ? '✓ Utilizada' : 
                                  '✗ Cancelada'}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fecha de Emisión</span>
                            <span class="value">${new Date(boleta.fecha_emision).toLocaleString('es-PE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                    </div>
                </div>

                <div class="qr-section">
                    <h3>📱 Código QR del Servicio</h3>
                    <div class="qr-container">
                        <canvas id="qr-canvas"></canvas>
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 14px;">
                        <strong>Presenta este código para acceder al servicio</strong><br>
                        <small>El código QR contiene toda la información del servicio en formato JSON</small>
                    </p>
                </div>

                <div class="importante">
                    <h4>⚠️ Información Importante</h4>
                    <ul>
                        ${esValeCorporativo ? `
                        <li>Presenta el código del vale al momento de realizar tu compra</li>
                        <li>Cada uso consumirá 1 ${boleta.vales?.[0]?.tipo === 'entrada' ? 'entrada' : 'combo'} del vale</li>
                        <li>El vale es válido hasta la fecha de expiración indicada</li>
                        <li>No se realizan devoluciones por vales no utilizados</li>
                        <li>El vale es intransferible y solo puede ser usado por el titular</li>
                        ` : `
                        <li>Presenta esta boleta y el código QR al personal de CineStar</li>
                        <li>Llega 15 minutos antes del horario programado</li>
                        <li>${boleta.tipo === 'funcion_privada' ? 'La función privada tiene una duración fija de 3 horas' : 'Respeta el horario de alquiler indicado'}</li>
                        <li>Esta boleta es intransferible</li>
                        `}
                        <li>Consulta los términos y condiciones en www.cinestar.com.pe</li>
                    </ul>
                </div>

                <div class="footer">
                    <p><strong>CineStar Perú</strong></p>
                    <p>www.cinestar.com.pe | info@cinestar.com.pe</p>
                    <p>Impreso el ${new Date().toLocaleString('es-PE')}</p>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
                <script>
                    window.onload = function() {
                        var qrData = ${JSON.stringify(boleta.codigo_qr)};
                        var canvas = document.getElementById('qr-canvas');
                        
                        QRCode.toCanvas(canvas, qrData, {
                            width: 250,
                            margin: 2,
                            errorCorrectionLevel: 'H'
                        }, function(error) {
                            if (error) {
                                console.error(error);
                                return;
                            }
                            
                            // Esperar un momento y luego imprimir
                            setTimeout(function() {
                                window.print();
                                
                                // Cerrar el iframe después de imprimir o cancelar
                                setTimeout(function() {
                                    window.parent.document.body.removeChild(window.parent.document.querySelector('iframe'));
                                }, 1000);
                            }, 500);
                        });
                    };
                    
                    // Detectar cuando se cancela la impresión
                    window.onafterprint = function() {
                        setTimeout(function() {
                            if (window.parent.document.querySelector('iframe')) {
                                window.parent.document.body.removeChild(window.parent.document.querySelector('iframe'));
                            }
                        }, 100);
                    };
                </script>
            </body>
        </html>`;
        
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando compras...</div>;
    }

    // Si es admin, mostrar mensaje
    if (user?.rol === 'admin') {
        return (
            <div className="mis-compras">
                <div className="admin-message-container">
                    <div className="admin-message-card">
                        <div className="admin-icon">🎬</div>
                        <h2>Panel de Administración</h2>
                        <p className="admin-message-text">
                            Los administradores no pueden realizar compras personales.
                        </p>
                        <p className="admin-message-subtext">
                            Para gestionar las órdenes de todos los clientes, dirígete al Panel Admin.
                        </p>
                        <button 
                            className="btn-panel-admin" 
                            onClick={() => navigate('/admin')}
                        >
                            Ir al Panel Admin →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-compras">
            {/* Header para impresión */}
            <div className="print-header">
                <img src="/logo.png" alt="CineStar" className="print-logo" />
                <h1 className="print-title">CineStar</h1>
                <p className="print-subtitle">Comprobante de Compra</p>
            </div>

            <h2>Mis Compras</h2>

            {/* Tabs para cambiar entre vistas - Mostrar siempre si es usuario corporativo/cliente */}
            {(user?.rol === 'corporativo' || user?.rol === 'cliente') && (
                <div className="compras-tabs">
                    {/* Solo mostrar tab de Tickets si el usuario tiene órdenes regulares */}
                    {ordenes.length > 0 && (
                        <button 
                            className={`tab-btn ${vistaActiva === 'tickets' ? 'active' : ''}`}
                            onClick={() => setVistaActiva('tickets')}
                        >
                            🎫 Tickets ({ordenes.length})
                        </button>
                    )}
                    <button 
                        className={`tab-btn ${vistaActiva === 'corporativo' ? 'active' : ''}`}
                        onClick={() => setVistaActiva('corporativo')}
                    >
                        🏢 Servicios Corporativos ({boletasCorporativas.length})
                    </button>
                </div>
            )}

            {/* Vista de Tickets */}
            {vistaActiva === 'tickets' && (
                <>
                    {ordenes.length === 0 ? (
                        <div className="sin-compras">
                            <div className="sin-compras-icono">🎬</div>
                            <h3>No tienes compras de tickets aún</h3>
                            <p>Cuando compres tickets para películas, aparecerán aquí.</p>
                            <button 
                                className="btn-explorar"
                                onClick={() => navigate('/movies')}
                            >
                                🍿 Ver Cartelera
                            </button>
                        </div>
                    ) : (
                        <div className="compras-list">
                            {ordenes.map(orden => {
                                const total = calcularTotal(orden);
                                const isExpanded = ordenExpandida === orden.id;

                                return (
                                    <div key={orden.id} className="compra-card">
                                        {/* Información del cliente para impresión */}
                                        <div className="print-cliente-info">
                                            <p><strong>Cliente:</strong> {orden.usuario?.nombre || 'N/A'}</p>
                                            <p><strong>Email:</strong> {orden.usuario?.email || 'N/A'}</p>
                                        </div>

                                <div className="compra-header" onClick={() => toggleOrden(orden.id)}>
                                    <div>
                                        <h3>Orden #{orden.id}</h3>
                                        <p className="fecha">{new Date(orden.fecha_compra).toLocaleString('es-PE', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div className="compra-summary">
                                        <span className={`estado estado-${orden.estado}`}>
                                            {orden.estado}
                                        </span>
                                        <p className="total-preview">S/ {total.toFixed(2)}</p>
                                        <button className="btn-expand">
                                            {isExpanded ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="compra-details">
                                        {/* Información de la Función y Película */}
                                        {orden.funcion && (
                                            <div className="seccion-detalle seccion-funcion">
                                                <h4>🎬 Información de la Función</h4>
                                                <div className="info-funcion">
                                                    <p><strong>Película:</strong> {orden.funcion.pelicula?.titulo || 'N/A'}</p>
                                                    <p><strong>Fecha de función:</strong> {(() => {
                                                        const fecha = new Date(orden.funcion.fecha + 'T00:00:00');
                                                        return fecha.toLocaleDateString('es-PE', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        });
                                                    })()}</p>
                                                    <p><strong>Hora:</strong> {orden.funcion.hora}</p>
                                                    <p><strong>Sede:</strong> {orden.funcion.sala?.sede?.nombre || 'N/A'}</p>
                                                    <p><strong>Sala:</strong> {orden.funcion.sala?.nombre || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Resumen de Tickets (compacto) */}
                                        {orden.ordenTickets && orden.ordenTickets.length > 0 && (
                                            <div className="seccion-detalle seccion-tickets-resumen">
                                                <h4>🎫 Tickets Comprados</h4>
                                                <div className="tickets-lista-simple">
                                                    {orden.ordenTickets.map((ot, index) => (
                                                        <div key={ot.id || index} className="ticket-item-simple">
                                                            <span className="ticket-bullet">•</span>
                                                            <span className="ticket-text">
                                                                <strong>x{ot.cantidad}</strong> Ticket{ot.cantidad > 1 ? 's' : ''} <strong>{ot.tipoTicket?.nombre || 'General'}</strong>
                                                            </span>
                                                            <span className="ticket-precio-simple">
                                                                S/ {(Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tickets y Asientos */}
                                        {orden.ordenTickets && orden.ordenTickets.length > 0 && (
                                            <div className="seccion-detalle">
                                                <h4>🪑 Asientos Asignados</h4>
                                                {orden.ordenTickets.map((ot) => (
                                                    <div key={ot.id} className="orden-ticket-item">
                                                        {/* Asientos compactos */}
                                                        {ot.tickets && ot.tickets.length > 0 && (
                                                            <div className="asientos-compactos">
                                                                <p><strong>{ot.tipoTicket?.nombre || 'Ticket'}:</strong></p>
                                                                <div className="asientos-badges-row">
                                                                    {ot.tickets.map((ticket) => (
                                                                        <span key={ticket.id} className="asiento-badge-small">
                                                                            {ticket.asientoFuncion ? 
                                                                                `${ticket.asientoFuncion.fila}${ticket.asientoFuncion.numero}` : 
                                                                                'N/A'
                                                                            }
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Combos */}
                                        {orden.ordenCombos && orden.ordenCombos.length > 0 && (
                                            <div className="seccion-detalle">
                                                <h4>🍿 Combos</h4>
                                                <ul className="combos-list">
                                                    {orden.ordenCombos.map((oc) => (
                                                        <li key={oc.id}>
                                                            <span><strong>{oc.combo?.nombre || 'N/A'}</strong></span>
                                                            <span>x{oc.cantidad}</span>
                                                            <span>S/ {(Number(oc.precio_unitario) * Number(oc.cantidad)).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Resumen de Pago */}
                                        <div className="seccion-detalle resumen-pago">
                                            <h4>💰 Resumen de Pago</h4>
                                            {(() => {
                                                // Calcular si hubo descuento
                                                let subtotalOriginal = 0;
                                                let descuentoTotal = 0;
                                                let porcentajeDescuento = 0;
                                                let tipoDescuento = '';
                                                
                                                // Tickets
                                                if (orden.ordenTickets && orden.ordenTickets.length > 0) {
                                                    orden.ordenTickets.forEach(ot => {
                                                        const subtotal = Number(ot.precio_unitario || 0) * Number(ot.cantidad || 1);
                                                        const desc = Number(ot.descuento || 0);
                                                        subtotalOriginal += subtotal;
                                                        descuentoTotal += desc;
                                                        
                                                        // Calcular porcentaje si hay descuento
                                                        if (desc > 0 && subtotal > 0) {
                                                            porcentajeDescuento = (desc / subtotal) * 100;
                                                            tipoDescuento = 'Tickets';
                                                        }
                                                    });
                                                }
                                                
                                                // Combos
                                                if (orden.ordenCombos && orden.ordenCombos.length > 0) {
                                                    orden.ordenCombos.forEach(oc => {
                                                        const subtotal = Number(oc.precio_unitario || 0) * Number(oc.cantidad || 0);
                                                        const desc = Number(oc.descuento || 0);
                                                        subtotalOriginal += subtotal;
                                                        descuentoTotal += desc;
                                                        
                                                        // Calcular porcentaje si hay descuento
                                                        if (desc > 0 && subtotal > 0 && !tipoDescuento) {
                                                            porcentajeDescuento = (desc / subtotal) * 100;
                                                            tipoDescuento = 'Combos';
                                                        }
                                                    });
                                                }
                                                
                                                return descuentoTotal > 0 ? (
                                                    <>
                                                        <div className="linea-subtotal">
                                                            <span>Subtotal:</span>
                                                            <span>S/ {subtotalOriginal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="linea-descuento">
                                                            <span style={{ color: '#27ae60' }}>
                                                                💎 Descuento Vale ({porcentajeDescuento.toFixed(0)}% en {tipoDescuento}):
                                                            </span>
                                                            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                                                                - S/ {descuentoTotal.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : null;
                                            })()}
                                            <div className="linea-total">
                                                <span className="label-total">Total Pagado:</span>
                                                <span className="valor-total">S/ {total.toFixed(2)}</span>
                                            </div>
                                            {orden.pago && (
                                                <div className="info-pago">
                                                    <p className="metodo-pago">
                                                        <strong>Método de pago:</strong> {orden.pago.metodoPago?.nombre || 'No especificado'}
                                                    </p>
                                                    <p className="metodo-pago">
                                                        <strong>Fecha de pago:</strong> {orden.pago.fecha_pago ? 
                                                            new Date(orden.pago.fecha_pago).toLocaleString('es-PE') : 
                                                            'N/A'
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className={`estado-pago estado-${orden.pago.estado_pago}`}>
                                                            Estado: {orden.pago.estado_pago.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Code ÚNICO para toda la orden */}
                                        <div className="seccion-qr-compra">
                                            <h4>📱 Código QR de la Compra</h4>
                                            <div className="qr-wrapper">
                                                <img 
                                                    src={generarQR(orden)} 
                                                    alt={`QR Orden ${orden.id}`}
                                                    title="Escanea este código al ingresar al cine"
                                                    className="qr-code-imagen"
                                                />
                                                <div className="qr-info-texto">
                                                    <p className="qr-titulo">Presenta este código al ingresar</p>
                                                    <p className="qr-orden">Orden #{orden.id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de acción */}
                                        <div className="acciones-compra">
                                            <button 
                                                className="btn-comprobante"
                                                onClick={() => printOrden(orden)}
                                            >
                                                🖨️ Imprimir Comprobante
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
                </>
            )}

            {/* Vista de Servicios Corporativos */}
            {vistaActiva === 'corporativo' && (
                <>
                    {boletasCorporativas.length === 0 ? (
                        <div className="sin-compras">
                            <div className="sin-compras-icono">🏢</div>
                            <h3>No tienes servicios corporativos registrados aún</h3>
                            <p>
                                {user?.rol === 'corporativo' 
                                    ? 'Cuando contrates servicios corporativos, aparecerán aquí.' 
                                    : 'Los servicios corporativos están disponibles solo para usuarios empresariales.'}
                            </p>
                            {user?.rol === 'corporativo' && (
                                <button 
                                    className="btn-explorar"
                                    onClick={() => navigate('/corporate')}
                                >
                                    📋 Ver Servicios Corporativos
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="compras-list">
                            {boletasCorporativas.map(boleta => {
                                const isExpanded = boletaExpandida === boleta.id;
                                const datosQR = extraerDatosQR(boleta.codigo_qr);
                                const detalles = boleta.detalles;

                                return (
                                    <div key={boleta.id} className="compra-card boleta-corporativa-card">
                                        <div className="compra-header" onClick={() => toggleBoleta(boleta.id)}>
                                            <div>
                                                <h3>
                                                    {boleta.tipo === 'funcion_privada' ? '🎬 Función Privada' : 
                                                     boleta.tipo === 'alquiler_sala' ? '🏢 Alquiler de Sala' : 
                                                     boleta.tipo === 'publicidad' ? '📢 Publicidad' :
                                                     '🎟️ Vales Corporativos'} 
                                                    <span className="codigo-corto">{datosQR.codigo}</span>
                                                </h3>
                                                <p className="fecha">
                                                    {boleta.tipo === 'vales_corporativos' && detalles?.fecha_compra ? 
                                                        new Date(detalles.fecha_compra).toLocaleDateString('es-PE', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) :
                                                        detalles?.fecha ? new Date(detalles.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) : 'N/A'
                                                    }
                                                </p>
                                                {boleta.tipo === 'vales_corporativos' && boleta.vales && (
                                                    <p style={{ 
                                                        marginTop: '8px', 
                                                        fontSize: '0.95em', 
                                                        color: boleta.vales.reduce((sum, v) => sum + (v.usos_disponibles || 0), 0) > 0 ? '#4CAF50' : '#d32f2f',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        📊 {boleta.vales.reduce((sum, v) => sum + (v.usos_disponibles || 0), 0)} de {boleta.vales.reduce((sum, v) => sum + (v.cantidad_usos || 1), 0)} usos restantes
                                                    </p>
                                                )}
                                            </div>
                                            <div className="compra-summary">
                                                <span className={`estado estado-${boleta.estado}`}>
                                                    {boleta.estado}
                                                </span>
                                                <button className="btn-expand">
                                                    {isExpanded ? '▲' : '▼'}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="compra-details">
                                                {/* Información del Servicio */}
                                                {boleta.tipo !== 'vales_corporativos' && (
                                                    <div className="seccion-detalle seccion-funcion">
                                                        <h4>📋 Información del Servicio</h4>
                                                        <div className="info-funcion">
                                                            {boleta.tipo === 'funcion_privada' && (
                                                                <>
                                                                    <p><strong>Película:</strong> {detalles?.pelicula?.titulo || datosQR.servicio?.pelicula || 'N/A'}</p>
                                                                    <p><strong>Duración:</strong> 3 horas (Función Privada)</p>
                                                                </>
                                                            )}
                                                            <p><strong>Sede:</strong> {detalles?.sala?.sede?.nombre || datosQR.servicio?.sede || 'N/A'}</p>
                                                            <p><strong>Sala:</strong> {detalles?.sala?.nombre || datosQR.servicio?.sala || 'N/A'} ({detalles?.sala?.tipo_sala || datosQR.servicio?.tipo_sala || 'N/A'})</p>
                                                            <p><strong>Fecha:</strong> {detalles?.fecha || datosQR.servicio?.fecha || 'N/A'}</p>
                                                            <p><strong>Horario:</strong> {detalles?.hora_inicio || datosQR.servicio?.hora_inicio || 'N/A'} - {detalles?.hora_fin || datosQR.servicio?.hora_fin || 'N/A'}</p>
                                                            {(detalles?.descripcion_evento || datosQR.servicio?.descripcion) && (
                                                                <p><strong>Descripción:</strong> {detalles?.descripcion_evento || datosQR.servicio?.descripcion}</p>
                                                            )}
                                                            {detalles?.precio && (
                                                                <p className="precio-destacado"><strong>Precio:</strong> S/ {parseFloat(detalles.precio).toFixed(2)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Información de Vales Corporativos */}
                                                {boleta.tipo === 'vales_corporativos' && (
                                                    <>
                                                        <div className="seccion-detalle seccion-vales-info">
                                                            <h4>🎟️ Información de la Compra</h4>
                                                            <div className="info-funcion">
                                                                <p><strong>Códigos generados:</strong> {boleta.vales?.length || 0}</p>
                                                                <p><strong>Total de usos comprados:</strong> {boleta.vales?.reduce((sum, v) => sum + (v.cantidad_usos || 1), 0) || 0} usos</p>
                                                                <p><strong>Usos disponibles restantes:</strong> <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1em' }}>{boleta.vales?.reduce((sum, v) => sum + (v.usos_disponibles || 0), 0) || 0} usos</span></p>
                                                                <p><strong>Precio por uso:</strong> S/ 7.00</p>
                                                                <p><strong>Descuento que otorga:</strong> 20% en {boleta.vales?.[0]?.tipo === 'entrada' ? 'entradas' : 'combos'}</p>
                                                                <p><strong>Fecha de compra:</strong> {detalles?.fecha_compra ? new Date(detalles.fecha_compra).toLocaleDateString('es-PE', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) : 'N/A'}</p>
                                                                {detalles?.monto_total != null && (
                                                                    <p className="precio-destacado">
                                                                        <strong>Total pagado:</strong> S/ {parseFloat(detalles.monto_total).toFixed(2)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Listado de Vales */}
                                                        {boleta.vales && boleta.vales.length > 0 && (
                                                            <div className="seccion-detalle seccion-vales-lista">
                                                                <h4>🎫 Tu Vale de Descuento</h4>
                                                                <div className="vales-grid">
                                                                    {boleta.vales.map((vale, index) => (
                                                                        <div key={vale.id || index} className={`vale-card ${vale.usado ? 'usado' : 'disponible'}`}>
                                                                            <div className="vale-header">
                                                                                <span className="vale-numero">Código del Vale</span>
                                                                                <span className={`vale-estado ${vale.usado ? 'usado' : 'vigente'}`}>
                                                                                    {vale.usado ? '✗ Agotado (0 usos)' : `✓ Vigente (${vale.usos_disponibles || 0} de ${vale.cantidad_usos || 1} usos restantes)`}
                                                                                </span>
                                                                            </div>
                                                                            <div className="vale-codigo-display">
                                                                                <p className="vale-codigo-label">Código:</p>
                                                                                <p className="vale-codigo-texto">{vale.codigo}</p>
                                                                            </div>
                                                                            <div className="vale-detalles">
                                                                                <div className="vale-detalle-item">
                                                                                    <span className="vale-label">Tipo:</span>
                                                                                    <span className="vale-value">{vale.tipo === 'entrada' ? '🎬 Entrada' : '🍿 Combo'}</span>
                                                                                </div>
                                                                                <div className="vale-detalle-item">
                                                                                    <span className="vale-label">Descuento:</span>
                                                                                    <span className="vale-value valor-destacado">{parseFloat(vale.valor).toFixed(0)}% de descuento</span>
                                                                                </div>
                                                                                <div className="vale-detalle-item">
                                                                                    <span className="vale-label">Usos:</span>
                                                                                    <span className="vale-value" style={{ fontWeight: 'bold', color: vale.usado ? '#d32f2f' : '#4CAF50' }}>
                                                                                        {vale.usos_disponibles || 0} de {vale.cantidad_usos || 1} disponible(s)
                                                                                        {vale.usado && ' (AGOTADO)'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="vale-detalle-item">
                                                                                    <span className="vale-label">Vencimiento:</span>
                                                                                    <span className="vale-value fecha-vencimiento">
                                                                                        {new Date(vale.fecha_expiracion).toLocaleDateString('es-PE', {
                                                                                            year: 'numeric',
                                                                                            month: 'short',
                                                                                            day: 'numeric'
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="vales-nota">
                                                                    <p>💡 <strong>Cómo usar tu vale:</strong> Presenta este código al momento de comprar tus tickets o combos para obtener <strong>20% de descuento</strong>. Puedes usar el mismo código las veces indicadas en "Usos disponibles".</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* QR Code */}
                                                <div className="seccion-qr-compra">
                                                    <h4>📱 Código QR del Servicio</h4>
                                                    <div className="qr-wrapper">
                                                        <div className="qr-code-svg">
                                                            <QRCode 
                                                                value={boleta.codigo_qr} 
                                                                size={200}
                                                                level="H"
                                                            />
                                                        </div>
                                                        <div className="qr-info-texto">
                                                            <p className="qr-titulo">Presenta este código para acceder</p>
                                                            <p className="qr-orden">Código: {datosQR.codigo}</p>
                                                            <p className="qr-tipo">Tipo: {datosQR.tipo || (boleta.tipo === 'funcion_privada' ? 'FUNCION_PRIVADA' : 'ALQUILER_SALA')}</p>
                                                            <p className="qr-info">El código QR contiene toda la información del servicio en formato JSON</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Estado de la boleta */}
                                                <div className="seccion-detalle">
                                                    <h4>📄 Estado de la Boleta</h4>
                                                    <div className="info-estado">
                                                        <p><strong>Estado:</strong> 
                                                            <span className={`estado-badge ${boleta.estado}`}>
                                                                {boleta.estado === 'activa' ? '✓ Activa' : 
                                                                 boleta.estado === 'utilizada' ? '✓ Utilizada' : 
                                                                 '✗ Cancelada'}
                                                            </span>
                                                        </p>
                                                        <p><strong>Fecha de emisión:</strong> {new Date(boleta.fecha_emision).toLocaleString('es-PE')}</p>
                                                    </div>
                                                </div>

                                                {/* Botón de imprimir */}
                                                <div className="acciones-compra">
                                                    <button 
                                                        className="btn-comprobante"
                                                        onClick={() => printBoletaCorporativa(boleta)}
                                                    >
                                                        🖨️ Imprimir Boleta
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MisCompras;

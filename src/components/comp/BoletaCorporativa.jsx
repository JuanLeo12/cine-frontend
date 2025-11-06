import React from "react";
import QRCode from "react-qr-code";
import "./css/BoletaCorporativa.css";

function BoletaCorporativa({ boleta, onCerrar }) {
  if (!boleta) return null;

  // Extraer código corto del JSON si existe
  let codigoCorto = boleta.codigo_qr;
  let datosQR = null;
  try {
    datosQR = JSON.parse(boleta.codigo_qr);
    codigoCorto = datosQR.codigo || boleta.codigo_qr;
  } catch (e) {
    // Si no es JSON, usar el código completo
  }

  const handleDescargar = () => {
    // Crear una imagen completa de la boleta para descargar    
    // Temporalmente ocultar botones
    const acciones = document.querySelector('.boleta-acciones');
    const closeBtn = document.querySelector('.boleta-close');
    acciones.style.display = 'none';
    closeBtn.style.display = 'none';

    // Usar html2canvas o similar (por ahora, solo el QR)
    const svg = document.getElementById("qr-code-boleta");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 50, 50, 300, 300);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `boleta-corporativa-${codigoCorto}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      // Restaurar botones
      acciones.style.display = 'flex';
      closeBtn.style.display = 'block';
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleImprimir = () => {
    // Crear un iframe oculto para imprimir (mismo formato que MisCompras)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    
    // Verificar si es un vale corporativo
    const esValeCorporativo = boleta.tipo === 'vales_corporativos' || boleta.vales?.length > 0;
    
    // Determinar tipo de servicio
    const tipoServicio = esValeCorporativo 
      ? 'Vale Corporativo'
      : boleta.tipo_servicio === 'Función Privada' 
      ? 'Boleta de Función Privada' 
      : 'Boleta de Alquiler de Sala';
    const esFuncionPrivada = boleta.tipo_servicio === 'Función Privada';
    
    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Boleta Corporativa ${codigoCorto}</title>
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
                <p class="tipo-servicio">${tipoServicio}</p>
            </div>

            <div class="codigo-principal">
                <div class="label">Código de Boleta</div>
                <div class="codigo">${codigoCorto}</div>
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
                                <span class="vale-detail-label">Valor por uso</span>
                                <span class="vale-detail-value">S/ ${parseFloat(vale.valor).toFixed(2)}</span>
                            </div>
                            <div class="vale-detail">
                                <span class="vale-detail-label">Usos disponibles</span>
                                <span class="vale-detail-value">${vale.usos_disponibles || 0} de ${vale.cantidad_usos || 1}</span>
                            </div>
                            <div class="vale-detail">
                                <span class="vale-detail-label">Monto total</span>
                                <span class="vale-detail-value">S/ ${(parseFloat(vale.valor) * (vale.cantidad_usos || 1)).toFixed(2)}</span>
                            </div>
                            <div class="vale-detail">
                                <span class="vale-detail-label">Fecha de expiración</span>
                                <span class="vale-detail-value">${new Date(vale.fecha_expiracion).toLocaleDateString('es-PE')}</span>
                            </div>
                        </div>
                        <div class="vale-instrucciones">
                            <strong>📝 Instrucciones de uso:</strong>
                            <p>• Presenta este código al momento de realizar tu compra</p>
                            <p>• Cada uso consumirá ${vale.tipo === 'entrada' ? '1 entrada' : '1 combo'} del vale</p>
                            <p>• El vale es válido hasta la fecha de expiración indicada</p>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : `
                <!-- Información de Función Privada o Alquiler -->
                <div class="info-grid">
                    ${esFuncionPrivada && boleta.pelicula ? `
                    <div class="info-item">
                        <span class="label">Película</span>
                        <span class="value">${boleta.pelicula}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Duración</span>
                        <span class="value">3 horas (Función Privada)</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="label">Sala</span>
                        <span class="value">${boleta.sala}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Fecha del Evento</span>
                        <span class="value">${boleta.fecha}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Horario</span>
                        <span class="value">${boleta.horario}</span>
                    </div>
                </div>

                ${boleta.descripcion ? `
                <div class="descripcion-evento">
                    <strong>📝 Descripción del Evento:</strong>
                    <p>${boleta.descripcion}</p>
                </div>
                ` : ''}
                `}
            </div>

            ${boleta.precio ? `
            <div class="precio-destacado">
                <div class="label">PRECIO TOTAL</div>
                <div class="valor">S/ ${parseFloat(boleta.precio).toFixed(2)}</div>
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
                    <li>${esFuncionPrivada ? 'La función privada tiene una duración fija de 3 horas' : 'Respeta el horario de alquiler indicado'}</li>
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

  return (
    <div className="boleta-modal-overlay">
      <div className="boleta-modal">
        <button className="boleta-close" onClick={onCerrar}>
          ✕
        </button>

        <div className="boleta-content">
          <div className="boleta-header">
            <h2>🎬 CineStar - Boleta Corporativa</h2>
            <p className="boleta-tipo">{boleta.tipo_servicio}</p>
            <p className="boleta-codigo-ref">Código: {codigoCorto}</p>
          </div>

          <div className="boleta-qr-section">
            <QRCode
              id="qr-code-boleta"
              value={boleta.codigo_qr}
              size={220}
              level="H"
            />
            <p className="boleta-qr-nota">Escanea para ver detalles completos</p>
          </div>

          <div className="boleta-detalles">
            <div className="boleta-detalle-item">
              <span className="boleta-label">Fecha:</span>
              <span className="boleta-value">{boleta.fecha}</span>
            </div>
            <div className="boleta-detalle-item">
              <span className="boleta-label">Horario:</span>
              <span className="boleta-value">{boleta.horario}</span>
            </div>
            <div className="boleta-detalle-item">
              <span className="boleta-label">Sala:</span>
              <span className="boleta-value">{boleta.sala}</span>
            </div>
            {boleta.pelicula && (
              <div className="boleta-detalle-item">
                <span className="boleta-label">Película:</span>
                <span className="boleta-value">{boleta.pelicula}</span>
              </div>
            )}
            {boleta.descripcion && (
              <div className="boleta-detalle-item">
                <span className="boleta-label">Descripción:</span>
                <span className="boleta-value">{boleta.descripcion}</span>
              </div>
            )}
            
            {/* Mostrar vales corporativos si existen */}
            {boleta.vales && boleta.vales.length > 0 && (
              <div className="boleta-vales-section">
                <h4 className="boleta-vales-title">🎟️ Vale Generado</h4>
                {boleta.vales.map((vale, index) => (
                  <div key={index} className="boleta-vale-item">
                    <div className="boleta-vale-info">
                      <span className="boleta-vale-numero">Código del Vale</span>
                      <span className="boleta-vale-codigo">{vale.codigo}</span>
                    </div>
                    <div className="boleta-vale-detalles">
                      <span>Tipo: {vale.tipo === 'entrada' ? 'Entrada' : 'Combo'}</span>
                      <span>Valor por uso: S/ {parseFloat(vale.valor).toFixed(2)}</span>
                      <span>Usos disponibles: {vale.usos_disponibles || vale.cantidad_usos || 1}</span>
                      <span>Vence: {new Date(vale.fecha_expiracion).toLocaleDateString('es-PE')}</span>
                    </div>
                  </div>
                ))}
                <p className="boleta-vales-nota">
                  💡 Guarda este código para usar en tus próximas compras. Cada uso consumirá 1 entrada/combo.
                </p>
              </div>
            )}
            
            <div className="boleta-detalle-item boleta-precio">
              <span className="boleta-label">Total Pagado:</span>
              <span className="boleta-value">S/ {boleta.precio?.toFixed(2)}</span>
            </div>
          </div>

          <div className="boleta-estado">
            <span className={`boleta-badge ${boleta.estado}`}>
              {boleta.estado === 'activa' ? '✓ Activa' : 
               boleta.estado === 'utilizada' ? '✓ Utilizada' : 
               '✗ Cancelada'}
            </span>
          </div>

          <div className="boleta-nota">
            <p>
              📱 Presenta este código QR en la entrada del cine para acceder a tu
              {boleta.tipo_servicio === 'Función Privada' 
                ? ' función privada. Tendrás acceso a la sala durante 3 horas.' 
                : ' sala alquilada.'}
            </p>
          </div>

          <div className="boleta-acciones">
            <button onClick={handleDescargar} className="boleta-btn boleta-btn-descargar">
              📥 Descargar QR
            </button>
            <button onClick={handleImprimir} className="boleta-btn boleta-btn-imprimir">
              🖨️ Imprimir
            </button>
            <button onClick={onCerrar} className="boleta-btn boleta-btn-cerrar">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoletaCorporativa;

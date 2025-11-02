import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSalas,
  getSedes,
  getPeliculas,
  createAlquilerSala,
  createPublicidad,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./css/CorporateSales.css";

function CorporateSales() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [activeService, setActiveService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salas, setSalas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [alquilerForm, setAlquilerForm] = useState({
    id_sede: "",
    id_sala: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion_evento: "",
  });
  const [publicidadForm, setPublicidadForm] = useState({
    cliente: "",
    tipo: "pantalla",
    id_sede: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
  });
  const [funcionPrivadaForm, setFuncionPrivadaForm] = useState({
    id_sede: "",
    id_pelicula: "",
    id_sala: "",
    fecha: "",
    hora: "",
    cantidad_personas: "",
    descripcion_evento: "",
  });
  const [valesForm, setValesForm] = useState({ tipo: "entrada", cantidad: 1 });
  const [codigoValeGenerado, setCodigoValeGenerado] = useState(null);
  const isCorporativo =
    isLoggedIn && (user?.rol === "corporativo" || user?.rol === "admin");
  const PRECIOS = {
    funcionPrivada: 2500.0,
    alquilerSala: 1500.0,
    publicidad: {
      pantalla: 500,
      banner: 300,
      stand: 800,
      modulo: 600,
      activacion: 1200,
      popcorn: 400,
      tv_wall: 700,
    },
    vales: { entrada: 25.0, combo: 35.0 },
    // Multiplicadores por tipo de sala
    multiplicadorSala: {
      "2D": 1.0,      // Precio base
      "3D": 1.3,      // +30%
      "4DX": 1.8,     // +80%
      "Xtreme": 1.5   // +50%
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [sedesData, salasData, peliculasData] = await Promise.all([
          getSedes(),
          getSalas(),
          getPeliculas(),
        ]);
        setSedes(sedesData);
        setSalas(salasData);
        setPeliculas(peliculasData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    cargarDatos();
  }, []);

  // Helper: Obtener multiplicador de precio según tipo de sala
  const getMultiplicadorSala = (id_sala) => {
    const sala = salas.find(s => s.id === parseInt(id_sala));
    if (!sala) return 1.0;
    return PRECIOS.multiplicadorSala[sala.tipo_sala] || 1.0;
  };

  // Helper: Obtener tipo de sala
  const getTipoSala = (id_sala) => {
    const sala = salas.find(s => s.id === parseInt(id_sala));
    return sala ? sala.tipo_sala : '';
  };

  const handleAlquilerChange = (e) => {
    const { name, value } = e.target;
    setAlquilerForm((prev) => ({ ...prev, [name]: value }));
    if (name === "id_sede") {
      setAlquilerForm((prev) => ({ ...prev, id_sala: "" }));
    }
  };

  const handleAlquilerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const [horaIni, minIni] = alquilerForm.hora_inicio.split(":").map(Number);
      const [horaFin, minFin] = alquilerForm.hora_fin.split(":").map(Number);
      const horasAlquiler =
        (horaFin * 60 + minFin - horaIni * 60 - minIni) / 60;
      const multiplicador = getMultiplicadorSala(alquilerForm.id_sala);
      const tipoSala = getTipoSala(alquilerForm.id_sala);
      const precioBase = horasAlquiler * PRECIOS.alquilerSala;
      const precioTotal = precioBase * multiplicador;
      
      await createAlquilerSala({ ...alquilerForm, precio: precioTotal });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(
        `✅ Alquiler confirmado y pagado. Sala ${tipoSala}. Total: S/ ${precioTotal.toFixed(
          2
        )} (${horasAlquiler.toFixed(1)} horas)`
      );
      setAlquilerForm({
        id_sede: "",
        id_sala: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        descripcion_evento: "",
      });
      setActiveService(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handlePublicidadChange = (e) =>
    setPublicidadForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePublicidadSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fechaIni = new Date(publicidadForm.fecha_inicio);
      const fechaFin = new Date(publicidadForm.fecha_fin);
      const dias = Math.ceil((fechaFin - fechaIni) / (1000 * 60 * 60 * 24)) + 1;
      const precioTotal = dias * PRECIOS.publicidad[publicidadForm.tipo];
      await createPublicidad({ ...publicidadForm, precio: precioTotal });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(
        `✅ Campaña publicitaria contratada y pagada. Total: S/ ${precioTotal.toFixed(
          2
        )} (${dias} días)`
      );
      setPublicidadForm({
        cliente: "",
        tipo: "pantalla",
        id_sede: "",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: "",
      });
      setActiveService(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleFuncionPrivadaChange = (e) => {
    const { name, value } = e.target;
    setFuncionPrivadaForm((prev) => ({ ...prev, [name]: value }));
    if (name === "id_sede") {
      setFuncionPrivadaForm((prev) => ({ ...prev, id_sala: "" }));
    }
  };

  const handleFuncionPrivadaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const multiplicador = getMultiplicadorSala(funcionPrivadaForm.id_sala);
      const tipoSala = getTipoSala(funcionPrivadaForm.id_sala);
      const precioTotal = PRECIOS.funcionPrivada * multiplicador;
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(
        `✅ Función privada reservada y pagada. Sala ${tipoSala}. Total: S/ ${precioTotal.toFixed(
          2
        )}`
      );
      setFuncionPrivadaForm({
        id_sede: "",
        id_pelicula: "",
        id_sala: "",
        fecha: "",
        hora: "",
        cantidad_personas: "",
        descripcion_evento: "",
      });
      setActiveService(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleValesChange = (e) =>
    setValesForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const generateValeCode = () => {
    const prefix = valesForm.tipo === "entrada" ? "ENT" : "CMB";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    return `${prefix}-${random}-${timestamp}`;
  };

  const handleValesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const valorUnitario = PRECIOS.vales[valesForm.tipo];
      const total = valesForm.cantidad * valorUnitario;
      const codigoGenerado = generateValeCode();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCodigoValeGenerado({
        codigo: codigoGenerado,
        tipo: valesForm.tipo,
        cantidad: valesForm.cantidad,
        valor_unitario: valorUnitario,
        total: total,
      });
      setSuccess(
        `✅ Vales comprados exitosamente. Total pagado: S/ ${total.toFixed(2)}`
      );
      setValesForm({ tipo: "entrada", cantidad: 1 });
      setTimeout(() => setSuccess(""), 8000);
    } catch (err) {
      setError("Error al comprar vales");
    } finally {
      setLoading(false);
    }
  };

  const serviciosCorporativos = [
    {
      id: "funciones",
      titulo: "Funciones Privadas",
      icono: "🎬",
      descripcion: "Celebra cumpleaños o eventos especiales",
    },
    {
      id: "alquiler",
      titulo: "Alquiler de Salas",
      icono: "🏢",
      descripcion: "Conferencias, seminarios y eventos",
    },
    {
      id: "publicidad",
      titulo: "Publicidad",
      icono: "📺",
      descripcion: "Publicita tu marca en nuestras sedes",
    },
    {
      id: "vales",
      titulo: "Entradas y Combos",
      icono: "🎫",
      descripcion: "Vales corporativos para tu equipo",
    },
  ];

  return (
    <div className="corporate-sales">
      <div className="corporate-header">
        <h1
          style={{
            background: "linear-gradient(135deg, #e60000 0%, #ff6b6b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "3rem",
            marginBottom: "0.5rem",
          }}
        >
          🏢 VENTAS CORPORATIVAS ✨
        </h1>
        <p className="corporate-subtitle">
          {isCorporativo
            ? "Gestiona tus servicios corporativos"
            : "Conoce nuestros servicios para empresas"}
        </p>
      </div>
      {error && <div className="error-message">⚠️ {error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="servicios-grid">
        {serviciosCorporativos.map((servicio) => (
          <div
            key={servicio.id}
            className={`servicio-card ${
              activeService === servicio.id ? "active" : ""
            }`}
            onClick={() =>
              isCorporativo ? setActiveService(servicio.id) : null
            }
            style={{ cursor: isCorporativo ? "pointer" : "default" }}
          >
            <div className="servicio-icono">{servicio.icono}</div>
            <h3>{servicio.titulo}</h3>
            <p>{servicio.descripcion}</p>
            {isCorporativo && (
              <button className="btn-servicio" type="button">
                {activeService === servicio.id ? "✓ Activo" : "Seleccionar"}
              </button>
            )}
          </div>
        ))}
      </div>
      {isCorporativo && activeService && (
        <div className="servicio-content">
          {activeService === "funciones" && (
            <div className="funciones-section">
              <h2>🎬 Funciones Privadas</h2>
              <p>
                Celebra tu cumpleaños con tus amigos o familiares, agasaja a tus
                colaboradores o ven con tu colegio para vivir la experiencia del
                cine con una función especial eligiendo una película de
                cartelera.
              </p>
              <form
                onSubmit={handleFuncionPrivadaSubmit}
                className="service-form"
              >
                <select
                  name="id_sede"
                  value={funcionPrivadaForm.id_sede}
                  onChange={handleFuncionPrivadaChange}
                  required
                >
                  <option value="">Selecciona sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>

                <select
                  name="id_sala"
                  value={funcionPrivadaForm.id_sala}
                  onChange={handleFuncionPrivadaChange}
                  required
                  disabled={!funcionPrivadaForm.id_sede}
                >
                  <option value="">Selecciona sala</option>
                  {salas
                    .filter((s) => s.id_sede === parseInt(funcionPrivadaForm.id_sede))
                    .map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre} - Capacidad: {sala.capacidad} ({sala.tipo_sala})
                      </option>
                    ))}
                </select>

                <select
                  name="id_pelicula"
                  value={funcionPrivadaForm.id_pelicula}
                  onChange={handleFuncionPrivadaChange}
                  required
                >
                  <option value="">Selecciona película</option>
                  {peliculas.map((pelicula) => (
                    <option key={pelicula.id} value={pelicula.id}>
                      {pelicula.titulo}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  name="fecha"
                  value={funcionPrivadaForm.fecha}
                  onChange={handleFuncionPrivadaChange}
                  required
                />
                <input
                  type="time"
                  name="hora"
                  value={funcionPrivadaForm.hora}
                  onChange={handleFuncionPrivadaChange}
                  required
                  placeholder="Hora"
                />
                <input
                  type="number"
                  name="cantidad_personas"
                  value={funcionPrivadaForm.cantidad_personas}
                  onChange={handleFuncionPrivadaChange}
                  required
                  placeholder="Cantidad de personas"
                  min="1"
                />
                <textarea
                  name="descripcion_evento"
                  value={funcionPrivadaForm.descripcion_evento}
                  onChange={handleFuncionPrivadaChange}
                  placeholder="Describe tu evento"
                  rows="4"
                  required
                ></textarea>
                <div
                  style={{
                    background: "#e3f2fd",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    Precio: S/ {funcionPrivadaForm.id_sala 
                      ? (PRECIOS.funcionPrivada * getMultiplicadorSala(funcionPrivadaForm.id_sala)).toFixed(2)
                      : PRECIOS.funcionPrivada.toFixed(2)
                    }
                  </p>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    Incluye sala completa por 2-3 horas
                    {funcionPrivadaForm.id_sala && ` - Sala ${getTipoSala(funcionPrivadaForm.id_sala)}`}
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Procesando pago..." : "Reservar y Pagar"}
                </button>
              </form>
              <div
                className="info-contacto"
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>📧</strong> eventos@cinestar.com
                </p>
                <p>
                  <strong>📞</strong> (01) 555-CINE
                </p>
              </div>
            </div>
          )}
          {activeService === "alquiler" && (
            <div className="alquiler-section">
              <h2>🏢 Alquiler de Salas para Eventos</h2>
              <p>
                Ofrecemos nuestras salas de cine para: Conferencias de Prensa,
                Seminarios, Lanzamientos de productos, Avant Premiere, Charlas
                religiosas, Reuniones corporativas, etc.
              </p>
              <form onSubmit={handleAlquilerSubmit} className="service-form">
                <select
                  name="id_sede"
                  value={alquilerForm.id_sede}
                  onChange={handleAlquilerChange}
                  required
                >
                  <option value="">Selecciona sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
                <select
                  name="id_sala"
                  value={alquilerForm.id_sala}
                  onChange={handleAlquilerChange}
                  required
                  disabled={!alquilerForm.id_sede}
                >
                  <option value="">Selecciona sala</option>
                  {salas
                    .filter((s) => s.id_sede === parseInt(alquilerForm.id_sede))
                    .map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre} - Capacidad: {sala.capacidad} ({sala.tipo_sala})
                      </option>
                    ))}
                </select>
                <input
                  type="date"
                  name="fecha"
                  value={alquilerForm.fecha}
                  onChange={handleAlquilerChange}
                  required
                />
                <input
                  type="time"
                  name="hora_inicio"
                  value={alquilerForm.hora_inicio}
                  onChange={handleAlquilerChange}
                  required
                  placeholder="Hora inicio"
                />
                <input
                  type="time"
                  name="hora_fin"
                  value={alquilerForm.hora_fin}
                  onChange={handleAlquilerChange}
                  required
                  placeholder="Hora fin"
                />
                <textarea
                  name="descripcion_evento"
                  value={alquilerForm.descripcion_evento}
                  onChange={handleAlquilerChange}
                  placeholder="Descripción del evento"
                  rows="4"
                ></textarea>
                {alquilerForm.hora_inicio && alquilerForm.hora_fin && (
                  <div
                    style={{
                      background: "#e3f2fd",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      Precio estimado: S/{" "}
                      {(() => {
                        const [horaIni, minIni] = alquilerForm.hora_inicio
                          .split(":")
                          .map(Number);
                        const [horaFin, minFin] = alquilerForm.hora_fin
                          .split(":")
                          .map(Number);
                        const horas =
                          (horaFin * 60 + minFin - horaIni * 60 - minIni) / 60;
                        const multiplicador = alquilerForm.id_sala 
                          ? getMultiplicadorSala(alquilerForm.id_sala) 
                          : 1.0;
                        return (horas * PRECIOS.alquilerSala * multiplicador).toFixed(2);
                      })()}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      S/ {PRECIOS.alquilerSala.toFixed(2)} por hora
                      {alquilerForm.id_sala && ` - Sala ${getTipoSala(alquilerForm.id_sala)}`}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Procesando pago..." : "Alquilar y Pagar"}
                </button>
              </form>
            </div>
          )}
          {activeService === "publicidad" && (
            <div className="publicidad-section">
              <h2>📺 Publicidad</h2>
              <p>
                Brindamos: Publicidad en Pantalla, Publicidad en Lobbies
                (Stands, Banners, Módulos), Activaciones (Degustación,
                Volanteo), Publicidad en cajas de Popcorn, Publicidad en TV
                Walls.
              </p>
              <form onSubmit={handlePublicidadSubmit} className="service-form">
                <input
                  type="text"
                  name="cliente"
                  value={publicidadForm.cliente}
                  onChange={handlePublicidadChange}
                  placeholder="Nombre del cliente/empresa"
                  required
                />
                <select
                  name="tipo"
                  value={publicidadForm.tipo}
                  onChange={handlePublicidadChange}
                  required
                >
                  <option value="pantalla">
                    Pantalla - S/ {PRECIOS.publicidad.pantalla}/día
                  </option>
                  <option value="banner">
                    Banner - S/ {PRECIOS.publicidad.banner}/día
                  </option>
                  <option value="stand">
                    Stand - S/ {PRECIOS.publicidad.stand}/día
                  </option>
                  <option value="modulo">
                    Módulo - S/ {PRECIOS.publicidad.modulo}/día
                  </option>
                  <option value="activacion">
                    Activación - S/ {PRECIOS.publicidad.activacion}/día
                  </option>
                  <option value="popcorn">
                    Popcorn - S/ {PRECIOS.publicidad.popcorn}/día
                  </option>
                  <option value="tv_wall">
                    TV Wall - S/ {PRECIOS.publicidad.tv_wall}/día
                  </option>
                </select>
                <select
                  name="id_sede"
                  value={publicidadForm.id_sede}
                  onChange={handlePublicidadChange}
                  required
                >
                  <option value="">Selecciona sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={publicidadForm.fecha_inicio}
                  onChange={handlePublicidadChange}
                  required
                  placeholder="Fecha inicio"
                />
                <input
                  type="date"
                  name="fecha_fin"
                  value={publicidadForm.fecha_fin}
                  onChange={handlePublicidadChange}
                  required
                  placeholder="Fecha fin"
                />
                <textarea
                  name="descripcion"
                  value={publicidadForm.descripcion}
                  onChange={handlePublicidadChange}
                  placeholder="Descripción de la campaña"
                  rows="4"
                ></textarea>
                {publicidadForm.fecha_inicio && publicidadForm.fecha_fin && (
                  <div
                    style={{
                      background: "#e3f2fd",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      Precio estimado: S/{" "}
                      {(() => {
                        const fechaIni = new Date(publicidadForm.fecha_inicio);
                        const fechaFin = new Date(publicidadForm.fecha_fin);
                        const dias =
                          Math.ceil(
                            (fechaFin - fechaIni) / (1000 * 60 * 60 * 24)
                          ) + 1;
                        return (
                          dias * PRECIOS.publicidad[publicidadForm.tipo]
                        ).toFixed(2);
                      })()}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      S/ {PRECIOS.publicidad[publicidadForm.tipo].toFixed(2)}{" "}
                      por día
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Procesando pago..." : "Contratar y Pagar"}
                </button>
              </form>
            </div>
          )}
          {activeService === "vales" && (
            <div className="vale-section">
              <h2>🎫 Entradas y Combos Corporativos</h2>
              <p>
                Nuestras entradas y combos corporativos son la oportunidad
                perfecta para consolidar relaciones entre colaboradores.
                ¡Invierte en la unión de tu equipo hoy con nuestros vales
                corporativos!
              </p>
              {!codigoValeGenerado ? (
                <form onSubmit={handleValesSubmit} className="service-form">
                  <select
                    name="tipo"
                    value={valesForm.tipo}
                    onChange={(e) =>
                      setValesForm((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="entrada">
                      Vale de Entrada - S/ {PRECIOS.vales.entrada.toFixed(2)}{" "}
                      c/u
                    </option>
                    <option value="combo">
                      Vale de Combo - S/ {PRECIOS.vales.combo.toFixed(2)} c/u
                    </option>
                  </select>
                  <input
                    type="number"
                    name="cantidad"
                    value={valesForm.cantidad}
                    onChange={handleValesChange}
                    required
                    placeholder="Cantidad de usos del vale"
                    min="1"
                    max="1000"
                  />
                  <div
                    style={{
                      background: "#e3f2fd",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#1976d2",
                      }}
                    >
                      Total a pagar: S/{" "}
                      {(
                        valesForm.cantidad * PRECIOS.vales[valesForm.tipo]
                      ).toFixed(2)}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      {valesForm.cantidad} uso(s) × S/{" "}
                      {PRECIOS.vales[valesForm.tipo].toFixed(2)}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        fontSize: "0.85rem",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      Se generará 1 código con {valesForm.cantidad} usos
                      disponibles
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Procesando compra..." : "Comprar Vales"}
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    padding: "2rem",
                    borderRadius: "12px",
                    marginTop: "1rem",
                    border: "2px solid #4caf50",
                  }}
                >
                  <h3 style={{ color: "#2e7d32", marginTop: 0 }}>
                    ✅ ¡Vale Generado Exitosamente!
                  </h3>
                  <div
                    style={{
                      background: "white",
                      padding: "1.5rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      border: "2px dashed #4caf50",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      Código del Vale:
                    </p>
                    <p
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#e60000",
                        margin: "0",
                        fontFamily: "monospace",
                        letterSpacing: "2px",
                      }}
                    >
                      {codigoValeGenerado.codigo}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong>Tipo:</strong>{" "}
                      {codigoValeGenerado.tipo === "entrada"
                        ? "Entrada"
                        : "Combo"}
                    </p>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong>Usos disponibles:</strong>{" "}
                      {codigoValeGenerado.cantidad}
                    </p>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong>Valor por uso:</strong> S/{" "}
                      {codigoValeGenerado.valor_unitario.toFixed(2)}
                    </p>
                    <p style={{ margin: "0.5rem 0" }}>
                      <strong>Total pagado:</strong> S/{" "}
                      {codigoValeGenerado.total.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codigoValeGenerado.codigo);
                      alert("Código copiado al portapapeles");
                    }}
                    className="btn-primary"
                    style={{ marginTop: "1rem", marginRight: "0.5rem" }}
                  >
                    📋 Copiar Código
                  </button>
                  <button
                    onClick={() => setCodigoValeGenerado(null)}
                    className="btn-secondary"
                    style={{ marginTop: "1rem" }}
                  >
                    ← Generar Otro Vale
                  </button>
                </div>
              )}
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1.5rem",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <h3>✅ Beneficios:</h3>
                <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
                  <li>Los vales pueden ser utilizados en cualquier sede</li>
                  <li>Válidos por 12 meses desde la compra</li>
                  <li>Un código único con múltiples usos</li>
                  <li>
                    El código se desactiva automáticamente al agotar los usos
                  </li>
                  <li>Descuento del 10% vs precio regular</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      {!isCorporativo && (
        <div
          className="info-section"
          style={{
            maxWidth: "800px",
            margin: "3rem auto",
            padding: "2rem",
            background: "#f8f9fa",
            borderRadius: "12px",
          }}
        >
          <h2>¿Interesado en nuestros servicios?</h2>
          <div className="info-card">
            <h3>Beneficios Corporativos:</h3>
            <ul style={{ textAlign: "left", lineHeight: "2" }}>
              <li>✅ Funciones privadas exclusivas para tus eventos</li>
              <li>✅ Alquiler de salas para conferencias y seminarios</li>
              <li>✅ Publicidad en nuestras instalaciones</li>
              <li>✅ Vales prepagados para consolidar tu equipo</li>
              <li>✅ Tarifas preferenciales corporativas</li>
              <li>✅ Atención personalizada</li>
            </ul>
            <p
              style={{
                marginTop: "1.5rem",
                textAlign: "center",
                color: "#666",
              }}
            >
              <strong>Contacto:</strong> ventas@cinestar.com | Tel: (01)
              555-CINE
            </p>
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/")}
                className="btn-primary"
                style={{ marginTop: "1rem" }}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CorporateSales;

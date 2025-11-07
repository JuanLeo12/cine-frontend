// src/services/api.js
import axios from 'axios';

// Usar variable de entorno o fallback a localhost en desarrollo
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

console.log('🌐 API URL configurada:', BASE_URL);

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      const errorMsg = error.response?.data?.error || '';
      
      // Limpiar datos de sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Mostrar mensaje apropiado
      if (errorMsg.includes('expirado') || errorMsg.includes('inválido')) {
        alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      // Redirigir al home
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/* ----------------- PELÍCULAS ----------------- */

export const getPeliculas = async () => {
  try {
    const response = await api.get('/peliculas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo películas:', error);
    return [];
  }
};

export const getPeliculasPorTipo = async (tipo) => {
  try {
    const response = await api.get(`/peliculas?tipo=${tipo}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo películas por tipo:', error);
    return [];
  }
};

// Obtener solo películas en cartelera (endpoint específico)
export const getPeliculasEnCartelera = async () => {
  try {
    const response = await api.get('/peliculas/cartelera/activas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo películas en cartelera:', error);
    return [];
  }
};

export const getPeliculaById = async (id) => {
  try {
    const response = await api.get(`/peliculas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo película:', error);
    return null;
  }
};

export const filtrarPeliculas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams(filtros).toString();
    const endpoint = params ? `/peliculas?${params}` : `/peliculas`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error filtrando películas:', error);
    return [];
  }
};

export const createPelicula = async (peliculaData) => {
  try {
    const response = await api.post('/peliculas', peliculaData);
    return response.data;
  } catch (error) {
    console.error('Error creando película:', error);
    throw error;
  }
};

export const updatePelicula = async (id, peliculaData) => {
  try {
    const response = await api.put(`/peliculas/${id}`, peliculaData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando película:', error);
    throw error;
  }
};

export const deletePelicula = async (id) => {
  try {
    const response = await api.delete(`/peliculas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando película:', error);
    throw error;
  }
};

/* ----------------- SEDES ----------------- */

export const getSedes = async () => {
  try {
    const response = await api.get('/sedes');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sedes:', error);
    return [];
  }
};

export const getTodasLasSedes = async () => {
  try {
    const response = await api.get('/sedes/admin/todas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo todas las sedes:', error);
    return [];
  }
};

export const getSedeById = async (id) => {
  try {
    const response = await api.get(`/sedes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sede:', error);
    return null;
  }
};

export const createSede = async (sedeData) => {
  try {
    const response = await api.post('/sedes', sedeData);
    return response.data;
  } catch (error) {
    console.error('Error creando sede:', error);
    throw error;
  }
};

export const updateSede = async (id, sedeData) => {
  try {
    const response = await api.put(`/sedes/${id}`, sedeData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando sede:', error);
    throw error;
  }
};

export const deleteSede = async (id) => {
  try {
    const response = await api.delete(`/sedes/${id}`);
    return response;
  } catch (error) {
    console.error('Error eliminando sede:', error);
    throw error;
  }
};

export const reactivarSede = async (id) => {
  try {
    const response = await api.patch(`/sedes/${id}/reactivar`);
    return response.data;
  } catch (error) {
    console.error('Error reactivando sede:', error);
    throw error;
  }
};

/* ----------------- SALAS ----------------- */

export const getSalas = async () => {
  try {
    const response = await api.get('/salas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo salas:', error);
    return [];
  }
};

export const getSalaById = async (id) => {
  try {
    const response = await api.get(`/salas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sala:', error);
    return null;
  }
};

export const verificarDisponibilidadSala = async (id_sala, fecha, hora_inicio, hora_fin) => {
  try {
    const response = await api.get(`/salas/${id_sala}/disponibilidad`, {
      params: { fecha, hora_inicio, hora_fin }
    });
    return response.data;
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    throw error;
  }
};

/* ----------------- FUNCIONES ----------------- */

export const getFunciones = async () => {
  try {
    const response = await api.get('/funciones');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo funciones:', error);
    return [];
  }
};

export const getFuncionById = async (id) => {
  try {
    const response = await api.get(`/funciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo función:', error);
    return null;
  }
};

export const getFuncionesByPelicula = async (peliculaId) => {
  try {
    const response = await api.get(`/funciones/pelicula/${peliculaId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo funciones por película:', error);
    return [];
  }
};

export const createFuncion = async (funcionData) => {
  try {
    const response = await api.post('/funciones', funcionData);
    return response.data;
  } catch (error) {
    console.error('Error creando función:', error);
    throw error;
  }
};

export const getTodasFunciones = async () => {
  try {
    const response = await api.get('/funciones/admin/todas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo todas las funciones:', error);
    return [];
  }
};

export const desactivarFuncionesPasadas = async () => {
  try {
    const response = await api.post('/funciones/admin/desactivar-pasadas');
    return response.data;
  } catch (error) {
    console.error('Error desactivando funciones pasadas:', error);
    throw error;
  }
};

export const desactivarFuncion = async (id) => {
  try {
    const response = await api.patch(`/funciones/${id}/desactivar`);
    return response.data;
  } catch (error) {
    console.error('Error desactivando función:', error);
    throw error;
  }
};

/* ----------------- DULCERÍA -----------------*/

export const getCombos = async () => {
  try {
    const response = await api.get('/combos');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo combos:', error);
    return [];
  }
};

export const getComboById = async (id) => {
  try {
    const response = await api.get(`/combos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo combo:', error);
    return null;
  }
};

export const createCombo = async (comboData) => {
  try {
    const response = await api.post('/combos', comboData);
    return response.data;
  } catch (error) {
    console.error('Error creando combo:', error);
    throw error;
  }
};

export const updateCombo = async (id, comboData) => {
  try {
    const response = await api.put(`/combos/${id}`, comboData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando combo:', error);
    throw error;
  }
};

export const deleteCombo = async (id) => {
  try {
    const response = await api.delete(`/combos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando combo:', error);
    throw error;
  }
};

/* ----------------- ASIENTOS ----------------- */

export const getAsientosByFuncion = async (funcionId) => {
  try {
    const response = await api.get(`/asientos?id_funcion=${funcionId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo asientos:', error);
    return [];
  }
};

// Sistema anti-duplicación para bloquear asientos
const bloqueosPendientes = new Map(); // Key: "id_funcion-fila-numero", Value: Promise

export const bloquearAsiento = async (asientoData) => {
  const key = `${asientoData.id_funcion}-${asientoData.fila}-${asientoData.numero}`;
  
  // Si ya hay una petición en curso para este asiento, retornar la misma promesa
  if (bloqueosPendientes.has(key)) {
    console.log(`⚠️ Petición duplicada detectada para ${asientoData.fila}${asientoData.numero} - reutilizando promesa existente`);
    return bloqueosPendientes.get(key);
  }

  // Crear nueva promesa y guardarla
  const promesa = (async () => {
    try {
      const response = await api.post('/asientos/bloquear', asientoData);
      return response.data;
    } catch (error) {
      console.error('Error bloqueando asiento:', error);
      throw error;
    } finally {
      // Limpiar el cache después de 1 segundo
      setTimeout(() => {
        bloqueosPendientes.delete(key);
      }, 1000);
    }
  })();

  bloqueosPendientes.set(key, promesa);
  return promesa;
};

export const liberarAsiento = async (asientoData) => {
  try {
    const response = await api.post('/asientos/liberar', asientoData);
    return response.data;
  } catch (error) {
    console.error('Error liberando asiento:', error);
    throw error;
  }
};

export const liberarAsientosUsuarioEnFuncion = async (id_funcion) => {
  try {
    const response = await api.post(`/asientos/liberar-usuario/${id_funcion}`);
    return response.data;
  } catch (error) {
    console.error('Error liberando asientos del usuario:', error);
    throw error;
  }
};

export const getAsientosPorFuncion = async (id_funcion) => {
  try {
    const response = await api.get(`/asientos/funcion/${id_funcion}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo asientos de la función:', error);
    return [];
  }
};

/* ----------------- TIPOS DE TICKET ----------------- */

export const getTiposTicket = async () => {
  try {
    const response = await api.get('/tipos_ticket');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos de ticket:', error);
    return [];
  }
};

export const getTiposTicketPorSala = async (tipo_sala) => {
  try {
    const response = await api.get(`/tipos_ticket/por-sala?tipo_sala=${tipo_sala}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos de ticket por sala:', error);
    throw error;
  }
};

/* ----------------- MÉTODOS DE PAGO ----------------- */

export const getMetodosPago = async () => {
  try {
    const response = await api.get('/metodos_pago');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    return [];
  }
};

/* ----------------- ÓRDENES DE COMPRA ----------------- */

export const createOrdenCompra = async (ordenData) => {
  try {
    const response = await api.post('/ordenes', ordenData);
    return response.data;
  } catch (error) {
    console.error('Error creando orden de compra:', error);
    throw error;
  }
};

export const confirmarOrdenCompra = async (ordenId, data) => {
  try {
    const response = await api.post(`/ordenes/${ordenId}/confirmar`, data);
    return response.data;
  } catch (error) {
    console.error('Error confirmando orden de compra:', error);
    throw error;
  }
};

export const getOrdenesUsuario = async () => {
  try {
    const response = await api.get('/ordenes');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return [];
  }
};

export const getOrdenById = async (id) => {
  try {
    const response = await api.get(`/ordenes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    return null;
  }
};

export const cancelarOrden = async (ordenId) => {
  try {
    const response = await api.delete(`/ordenes/${ordenId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelando orden:', error);
    throw error;
  }
};

/* ----------------- PAGOS ----------------- */

export const createPago = async (pagoData) => {
  try {
    const response = await api.post('/pagos', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error creando pago:', error);
    throw error;
  }
};

export const confirmarPago = async (pagoId) => {
  try {
    const response = await api.patch(`/pagos/${pagoId}/confirmar`);
    return response.data;
  } catch (error) {
    console.error('Error confirmando pago:', error);
    throw error;
  }
};

/* ----------------- AUTENTICACIÓN ----------------- */

export const login = async (credentials) => {
  try {
    const response = await api.post('/usuarios/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/usuarios', userData);
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getPerfil = async () => {
  try {
    const response = await api.get('/usuarios/perfil');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return null;
  }
};

export const updatePerfil = async (userData) => {
  try {
    const response = await api.patch('/usuarios/perfil', userData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};

export const updateUsuario = async (id, userData) => {
  try {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};

/* ----------------- VALES CORPORATIVOS ----------------- */

export const getValesCorporativos = async () => {
  try {
    const response = await api.get('/vales');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo vales corporativos:', error);
    return [];
  }
};

export const crearValeCorporativo = async (valeData) => {
  try {
    const response = await api.post('/vales', valeData);
    return response.data;
  } catch (error) {
    console.error('Error creando vale corporativo:', error);
    throw error;
  }
};

export const getValeCorporativo = async (id) => {
  try {
    const response = await api.get(`/vales/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo vale corporativo:', error);
    return null;
  }
};

export const usarValeCorporativo = async (id) => {
  try {
    const response = await api.put(`/vales/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error usando vale corporativo:', error);
    throw error;
  }
};

export const validarValeCorporativo = async (codigo) => {
  try {
    // Llamar al endpoint de validación por código (autenticado)
    const response = await api.get(`/vales/validar/${encodeURIComponent(codigo)}`);
    // El backend devuelve { valido: true, vale: {...}, mensaje }
    return response.data;
  } catch (error) {
    console.error('Error validando vale corporativo:', error);
    
    // Mejorar mensajes de error según el código de estado
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error;
      
      if (status === 404) {
        throw new Error('❌ Vale no encontrado. Verifica el código ingresado.');
      } else if (status === 400 && errorMsg?.includes('vencido')) {
        throw new Error('⏰ Este vale ha expirado.');
      } else if (status === 400 && errorMsg?.includes('usado')) {
        throw new Error('⚠️ Este vale ya fue utilizado.');
      } else if (status === 400) {
        throw new Error('❌ ' + (errorMsg || 'Vale inválido.'));
      } else {
        throw new Error('❌ ' + (errorMsg || 'Error al validar el vale.'));
      }
    }
    
    throw new Error('❌ No se pudo conectar con el servidor. Intenta nuevamente.');
  }
};

export const marcarValeUsado = async (valeId) => {
  try {
    // El endpoint para actualizar vale es PUT /vales/:id
    const response = await api.put(`/vales/${valeId}`, { usado: true });
    return response.data;
  } catch (error) {
    console.error('Error marcando vale como usado:', error);
    throw error;
  }
};

/* ----------------- SERVICIOS CORPORATIVOS ----------------- */

// ALQUILER DE SALAS
export const getAlquileresSalas = async () => {
  try {
    const response = await api.get('/alquileres');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo alquileres:', error);
    throw error;
  }
};

export const createAlquilerSala = async (alquilerData) => {
  try {
    const response = await api.post('/alquileres', alquilerData);
    return response.data;
  } catch (error) {
    console.error('Error creando alquiler:', error);
    throw error;
  }
};

export const getAlquilerSalaById = async (id) => {
  try {
    const response = await api.get(`/alquileres/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo alquiler:', error);
    throw error;
  }
};

export const deleteAlquilerSala = async (id) => {
  try {
    const response = await api.delete(`/alquileres/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando alquiler:', error);
    throw error;
  }
};

// PUBLICIDAD
export const getPublicidad = async () => {
  try {
    const response = await api.get('/publicidad');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo campañas:', error);
    throw error;
  }
};

export const getPublicidadActiva = async () => {
  try {
    const response = await api.get('/publicidad/activas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo campañas activas:', error);
    return [];
  }
};

export const createPublicidad = async (publicidadData) => {
  try {
    // Si hay archivo, usar FormData, sino JSON normal
    if (publicidadData.archivo) {
      const formData = new FormData();
      
      // Agregar todos los campos al FormData
      Object.keys(publicidadData).forEach(key => {
        if (key === 'archivo') {
          formData.append('archivo', publicidadData.archivo);
        } else {
          formData.append(key, publicidadData[key]);
        }
      });

      // Usar la instancia api configurada que ya tiene el token en los interceptores
      const response = await api.post('/publicidad', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Sin archivo, usar JSON normal
      const response = await api.post('/publicidad', publicidadData);
      return response.data;
    }
  } catch (error) {
    console.error('Error creando campaña:', error);
    throw error;
  }
};

export const getPublicidadById = async (id) => {
  try {
    const response = await api.get(`/publicidad/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo campaña:', error);
    throw error;
  }
};

export const deletePublicidad = async (id) => {
  try {
    const response = await api.delete(`/publicidad/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando campaña:', error);
    throw error;
  }
};

export const descargarArchivoPublicidad = async (id) => {
  try {
    const response = await api.get(`/publicidad/${id}/descargar`, {
      responseType: 'blob' // Importante para archivos binarios
    });
    
    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'archivo_publicidad';
    
    if (contentDisposition) {
      // Soportar tanto filename="nombre" como filename=nombre
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Detectar el tipo de contenido
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Crear blob con el tipo correcto
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    // Crear link temporal y hacer click para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName; // Usar .download en lugar de setAttribute
    document.body.appendChild(link);
    link.click();
    
    // Limpiar después de un pequeño delay
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true };
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw error;
  }
};

// TARIFAS CORPORATIVAS
export const getTarifasCorporativas = async () => {
  try {
    const response = await api.get('/tarifas_corporativas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tarifas:', error);
    return [];
  }
};

// ====================
// 🎫 BOLETAS CORPORATIVAS
// ====================

export const crearBoletaCorporativa = async (tipo, id_referencia) => {
  try {
    const response = await api.post('/boletas-corporativas', {
      tipo,
      id_referencia
    });
    return response.data;
  } catch (error) {
    console.error('Error creando boleta corporativa:', error);
    throw error;
  }
};

export const obtenerBoletaPorQR = async (codigo_qr) => {
  try {
    const response = await api.get(`/boletas-corporativas/${codigo_qr}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo boleta:', error);
    throw error;
  }
};

export const obtenerMisBoletas = async () => {
  try {
    const response = await api.get('/boletas-corporativas/mis-boletas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mis boletas:', error);
    throw error;
  }
};

export const marcarBoletaUtilizada = async (codigo_qr) => {
  try {
    const response = await api.put(`/boletas-corporativas/${codigo_qr}/utilizar`);
    return response.data;
  } catch (error) {
    console.error('Error marcando boleta como utilizada:', error);
    throw error;
  }
};

// Admin: Obtener todas las boletas corporativas
export const obtenerTodasBoletasCorporativas = async () => {
  try {
    const response = await api.get('/boletas-corporativas/admin/todas');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo todas las boletas corporativas:', error);
    throw error;
  }
};

export default api;

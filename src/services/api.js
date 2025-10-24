// src/services/api.js
import axios from 'axios';

const BASE_URL = "http://localhost:4000";

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
    return response.data;
  } catch (error) {
    console.error('Error eliminando sede:', error);
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

/* ----------------- COMBOS ----------------- */

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

export const bloquearAsiento = async (asientoData) => {
  try {
    const response = await api.post('/asientos/bloquear', asientoData);
    return response.data;
  } catch (error) {
    console.error('Error bloqueando asiento:', error);
    throw error;
  }
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

export default api;

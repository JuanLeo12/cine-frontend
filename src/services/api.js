// src/services/api.js
const BASE_URL = "http://localhost:4000";

/**
 * Helper genérico para peticiones.
 * options:
 *  - method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
 *  - body: objeto JS (se serializa a JSON) o FormData (en cuyo caso no se añade Content-Type)
 *  - auth: boolean -> si true intenta leer token de localStorage ('token') y lo envía como Bearer
 *  - credentials: 'include' si usas cookies (opcional)
 */
const fetchData = async (
  endpoint,
  {
    method = "GET",
    body = null,
    auth = false,
    credentials = undefined,
    customHeaders = {},
  } = {}
) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { ...customHeaders };

    const init = { method };

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      // si body es FormData, no tocar Content-Type (fetch lo gestiona)
      init.body = body;
    }

    if (auth) {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    if (Object.keys(headers).length) init.headers = headers;
    if (credentials) init.credentials = credentials;

    const res = await fetch(url, init);

    // si no OK, intentar parsear JSON de error si existe
    if (!res.ok) {
      let errorBody = "";
      try {
        errorBody = await res.json();
      } catch (_) {
        errorBody = await res.text();
      }
      throw new Error(`HTTP ${res.status} - ${JSON.stringify(errorBody)}`);
    }

    // No content
    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }

    // si no es JSON (p. ej. descarga de archivo)
    return await res.text();
  } catch (error) {
    console.error(`API error [${method}] ${endpoint}:`, error);
    throw error; // propagar para que el caller lo maneje si lo desea
  }
};

/* ----------------- Funciones específicas / wrappers ----------------- */

// Obtener todas las películas
export const getPeliculas = async () => {
  try {
    return await fetchData("/peliculas");
  } catch (e) {
    return []; // compatibilidad con código anterior
  }
};

// Obtener películas por tipo (cartelera o proxEstreno)
export const getPeliculasPorTipo = async (tipo) => {
  try {
    return await fetchData(`/peliculas?tipo=${encodeURIComponent(tipo)}`);
  } catch (e) {
    return [];
  }
};

// Nombre compatible con tu Movies.jsx: filtrarPeliculas
export const filtrarPeliculas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams(filtros).toString();
    const endpoint = params ? `/peliculas?${params}` : `/peliculas`;
    return await fetchData(endpoint);
  } catch (e) {
    return [];
  }
};

// Alias (por si usas la otra denominación)
export const getPeliculasFiltradas = filtrarPeliculas;

/* ---------- CRUD de películas (requieren auth para POST/PATCH/DELETE en tu backend) ---------- */

// Crear película (devuelve la nueva película o lanza error). by default intenta usar token en localStorage
export const createPelicula = async (peliculaObj, { auth = true } = {}) => {
  try {
    return await fetchData("/peliculas", {
      method: "POST",
      body: peliculaObj,
      auth,
    });
  } catch (e) {
    // puedes devolver null o relanzar según prefieras; aquí devolvemos null para compatibilidad
    console.error("Error creando película:", e);
    return null;
  }
};

// Actualizar película
export const updatePelicula = async (id, peliculaObj, { auth = true } = {}) => {
  try {
    return await fetchData(`/peliculas/${id}`, {
      method: "PATCH",
      body: peliculaObj,
      auth,
    });
  } catch (e) {
    console.error("Error actualizando película:", e);
    return null;
  }
};

// Eliminar (soft delete)
export const deletePelicula = async (id, { auth = true } = {}) => {
  try {
    return await fetchData(`/peliculas/${id}`, { method: "DELETE", auth });
  } catch (e) {
    console.error("Error eliminando película:", e);
    return null;
  }
};

/* ----------------- Helpers de autenticación (ejemplos) ----------------- */

// Iniciar sesión (ajusta la ruta si tu backend usa otra)
export const login = async (credentials) => {
  // credentials: { email, password } o { usuario, password } según tu API
  try {
    const data = await fetchData("/usuarios/login", {
      method: "POST",
      body: credentials,
    });
    // ejemplo: guardar token si backend devuelve { token: '...' }
    if (data && data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  } catch (e) {
    console.error("Error en login:", e);
    throw e;
  }
};

// Cerrar sesión (simple)
export const logout = () => {
  localStorage.removeItem("token");
};

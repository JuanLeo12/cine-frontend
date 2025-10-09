const BASE_URL = 'http://localhost:4000';

export const getPeliculas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/peliculas`);
    if (!response.ok) {
      throw new Error('Error al obtener películas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getPeliculas:', error);
    return [];
  }
};
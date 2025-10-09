const BASE_URL = "http://localhost:4000";

// 🔹 Obtener todas las películas
export const getPeliculas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/peliculas`);
    if (!response.ok) {
      throw new Error("Error al obtener películas");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getPeliculas:", error);
    return [];
  }
};

// 🔹 Obtener películas filtradas por tipo (cartelera o proxEstreno)
export const getPeliculasPorTipo = async (tipo) => {
  try {
    const response = await fetch(`${BASE_URL}/peliculas?tipo=${tipo}`);
    if (!response.ok) {
      throw new Error("Error al obtener películas por tipo");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getPeliculasPorTipo:", error);
    return [];
  }
};

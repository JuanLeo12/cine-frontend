// Utilidad para verificar si el servidor se reinició
let serverStartTime = null;

export const checkServerStatus = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/server-status');
    const data = await response.json();
    
    if (serverStartTime === null) {
      // Primera vez que se ejecuta
      serverStartTime = data.startTime;
      return true;
    }
    
    if (serverStartTime !== data.startTime) {
      // El servidor se reinició
      console.log('⚠️ Servidor reiniciado detectado');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      serverStartTime = data.startTime;
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verificando estado del servidor:', error);
    return true; // Asumimos que está bien si hay error
  }
};

const serverCheck = { checkServerStatus };
export default serverCheck;

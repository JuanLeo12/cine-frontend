// Hook personalizado para verificar y manejar la sesión
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const sessionCheckInterval = useRef(null);

  useEffect(() => {
    // Verificar sesión cada 5 minutos
    sessionCheckInterval.current = setInterval(() => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        clearInterval(sessionCheckInterval.current);
        alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [navigate]);
};

export default useSessionCheck;

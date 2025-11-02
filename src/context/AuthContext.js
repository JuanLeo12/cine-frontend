import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { checkServerStatus } from '../utils/serverCheck';

const AuthContext = createContext();

const API_URL = 'http://localhost:4000';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario y token del localStorage al iniciar
    useEffect(() => {
        const initAuth = async () => {
            // Verificar si el servidor se reinició
            const serverOk = await checkServerStatus();
            
            if (!serverOk) {
                // Servidor reiniciado, limpiar sesión
                console.log('🔄 Servidor reiniciado - Sesión invalidada');
                setLoading(false);
                return;
            }
            
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsLoggedIn(true);
            }
            setLoading(false);
        };
        
        initAuth();
    }, []);

    // Verificar expiración de sesión cada 5 minutos
    useEffect(() => {
        if (!isLoggedIn) return;

        const checkSession = setInterval(() => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                // Token fue eliminado (por ejemplo, por el interceptor)
                logout();
                alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            }
        }, 5 * 60 * 1000); // 5 minutos

        return () => clearInterval(checkSession);
    }, [isLoggedIn]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/usuarios/login`, {
                email,
                password
            });

            if (response.data.token) {
                const { token, usuario } = response.data;
                
                // Guardar en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(usuario));
                
                // Actualizar estado
                setToken(token);
                setUser(usuario);
                setIsLoggedIn(true);
                
                return { success: true, usuario };
            }
            return { success: false, error: 'No se recibió token' };
        } catch (error) {
            console.error('Error en login:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al iniciar sesión' 
            };
        }
    };

    const register = async (datos) => {
        try {
            const response = await axios.post(`${API_URL}/usuarios/registro`, datos);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error en registro:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al registrar usuario' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
    };

    const isAdmin = () => {
        return user?.rol === 'admin';
    };

    const isCorporativo = () => {
        return user?.rol === 'corporativo';
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, 
            user, 
            setUser,
            token,
            loading,
            login, 
            logout,
            register,
            isAdmin,
            isCorporativo
        }}>
            {children}
        </AuthContext.Provider>
    );
};
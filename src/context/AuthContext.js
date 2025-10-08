import React, { createContext, useContext, useState } from 'react';
import { usuarios } from '../data/mockData';

const AuthContext = createContext();

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

    const login = (email, password) => {
        const foundUser = usuarios.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setIsLoggedIn(true);
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
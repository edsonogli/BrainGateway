// src/components/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        try {
            const response = await axios.post(
                'https://brainbot-hkdxhqbqe4hgbgb5.brazilsouth-01.azurewebsites.net/api/auth/login',
                credentials
            );
            if (response.status === 200) {
                const token = response.data.token; // Supondo que o token esteja na resposta
                localStorage.setItem('authToken', token); // Salva o token no localStorage
                setIsAuthenticated(true);
                setError(null);
            }
        } catch (err) {
            setError('Invalid login credentials');
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken'); // Remove o token ao deslogar
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

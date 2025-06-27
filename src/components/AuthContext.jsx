import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Novo estado para controlar carregamento

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('AuthContext - Verificando token:', token ? 'Presente' : 'Ausente');

        if (token) {
            try {
                // Verifica se o token está no formato correto
                if (!token.startsWith('Bearer ')) {
                    console.warn('Token sem prefixo Bearer, corrigindo...');
                    const formattedToken = `Bearer ${token.trim()}`;
                    localStorage.setItem('authToken', formattedToken);
                }
                setIsAuthenticated(true);
                console.log('AuthContext - Autenticação confirmada');
            } catch (error) {
                console.error('AuthContext - Erro ao processar token:', error);
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
            }
        } else {
            console.warn('AuthContext - Token não encontrado');
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        console.log('AuthContext - Realizando logout');
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        console.log('AuthContext - Logout concluído');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, setIsAuthenticated, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

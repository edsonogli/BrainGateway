import React, { createContext, useContext, useState, useEffect } from 'react';
import { debugLog, debugError } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('authToken');
                const storedUserData = localStorage.getItem('userData');
                
                debugLog('AuthContext - Verificando autenticação:', {
                    hasToken: !!token,
                    hasUserData: !!storedUserData
                });

                if (token) {
                    // Verifica se o token está no formato correto
                    if (!token.startsWith('Bearer ')) {
                        debugLog('AuthContext - Corrigindo formato do token');
                        const formattedToken = `Bearer ${token.trim()}`;
                        localStorage.setItem('authToken', formattedToken);
                    }

                    // Verifica e carrega os dados do usuário
                    if (storedUserData) {
                        try {
                            const parsedUserData = JSON.parse(storedUserData);
                            setUserData(parsedUserData);
                            debugLog('AuthContext - Dados do usuário carregados');
                        } catch (error) {
                            debugError('AuthContext - Erro ao processar dados do usuário:', error);
                            localStorage.removeItem('userData');
                        }
                    }

                    setIsAuthenticated(true);
                    debugLog('AuthContext - Autenticação confirmada');
                } else {
                    debugLog('AuthContext - Token não encontrado');
                    setIsAuthenticated(false);
                    setUserData(null);
                    localStorage.removeItem('userData');
                }
            } catch (error) {
                debugError('AuthContext - Erro ao verificar autenticação:', error);
                setIsAuthenticated(false);
                setUserData(null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = () => {
        debugLog('AuthContext - Iniciando processo de logout');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUserData(null);
        debugLog('AuthContext - Logout concluído');
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isLoading, 
            userData,
            setIsAuthenticated, 
            setUserData,
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

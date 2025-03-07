// src/contexts/ApiContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';    
import { useNavigate } from 'react-router-dom';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const { setIsAuthenticated } = useAuth(); 
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Configuração do Axios para incluir o token de autenticação em todas as requisições
    const api = axios.create({
        baseURL: API_BASE_URL,
    });

    // Adiciona o token de autenticação ao cabeçalho da requisição
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Interceptor para tratar erros de resposta
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Limpa o token e estado de autenticação
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
                // Redireciona para a página de login
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );

    // Wrapper function to handle loading state
    const withLoading = useCallback(async (operation) => {
        try {
            setIsLoading(true);
            const result = await operation();
            return result;
        } catch (error) {
            throw error;
        } finally {
            // Pequeno delay para evitar flickering
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }
    }, []);

    // Funções para cada endpoint usando useCallback
    const login = useCallback(async (credentials) => {
        return withLoading(async () => {
            const response = await api.post('/auth/login', credentials);
            const token = response.data.token;
            if (token) {
                localStorage.setItem('authToken', token); 
                setIsAuthenticated(true); 
            }
            return response.data;
        });
    }, [withLoading, setIsAuthenticated]);

    const getContacts = useCallback(() => 
        withLoading(() => api.get('/Wpp/Contacts').then(response => response.data)),
    [withLoading]);

    const InativeContact = useCallback((contactId) => 
        withLoading(() => api.post(`/Wpp/InativeContact?id=${contactId}`).then(response => response.status)),
    [withLoading]);

    const AtiveContact = useCallback((contactId) => 
        withLoading(() => api.post(`/Wpp/AtiveContact?id=${contactId}`).then(response => response.status)),
    [withLoading]);

    const getProjects = useCallback(() => 
        withLoading(() => api.get('/Brain/Projects').then(response => response.data)),
    [withLoading]);

    const getProjectById = useCallback((projectId) => 
        withLoading(() => api.get(`/Brain/Project?id=${projectId}`).then(response => response.data)),
    [withLoading]);

    const updateProject = useCallback((projectId, updatedData) => 
        withLoading(() => {
            var isTrueSet = (updatedData.active === 'true');
            updatedData.active = isTrueSet;
            return api.put(`/Brain/Project`, updatedData).then(response => response.data);
        }),
    [withLoading]);

    const createProject = useCallback((projectData) => 
        withLoading(() => api.post('/projects', projectData).then(response => response.data)),
    [withLoading]);

    const getLogs = useCallback(() => 
        withLoading(() => api.get('/Brain/Logs').then(response => response.data)),
    [withLoading]);

    const getAssistants = useCallback(() => 
        withLoading(() => api.get('/Gpt/Assistant').then(response => response.data)),
    [withLoading]);

    const getInstances = useCallback(() => 
        withLoading(() => api.get('/Wpp/Instances').then(response => response.data)),
    [withLoading]);

    const getChats = useCallback(() => 
        withLoading(() => api.get('/Brain/Chats').then(response => response.data)),
    [withLoading]);
    
    const value = {
        login,
        getContacts,
        InativeContact,
        AtiveContact,
        getProjects,
        getProjectById,
        updateProject,
        createProject,
        getLogs,
        getAssistants,
        getInstances,
        getChats,
        isLoading
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook personalizado para usar o ApiContext
export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};

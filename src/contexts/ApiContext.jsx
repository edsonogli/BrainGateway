// src/contexts/ApiContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, debugLog, debugError } from '../config';
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

    // Adiciona o token de autenticação ao cabeçalho da requisição e loga detalhes
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const formattedToken = token.trim();
            if (!formattedToken.startsWith('Bearer ')) {
                config.headers.Authorization = `Bearer ${formattedToken}`;
            } else {
                config.headers.Authorization = formattedToken;
            }
        } else {
            debugLog('Token de autenticação não encontrado');
        }

        // Adiciona Content-Type padrão se não estiver definido
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        debugLog('Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    });

    // Interceptor para tratar erros de resposta e logar detalhes
    api.interceptors.response.use(
        (response) => {
            debugLog('Response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });
            return response;
        },
        (error) => {
            debugError('API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 401) {
                // Limpa o token e estado de autenticação
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
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
            setIsLoading(false);
        }
    }, []);

    // Funções para cada endpoint usando useCallback
    const login = useCallback(async (credentials) => {
        return withLoading(async () => {
            debugLog('Tentando login com credenciais:', credentials);
            const response = await api.post('/Auth/Login', credentials);
            debugLog('Resposta do login:', response.data);

            let token = response.data.token || response.data.accessToken;
            if (token) {
                token = token.trim();
                if (!token.startsWith('Bearer ')) {
                    token = `Bearer ${token}`;
                }
                debugLog('Token extraído:', token);
                localStorage.setItem('authToken', token);
                
                // Armazena os dados do usuário
                const userData = {
                    userId: response.data.userId,
                    username: response.data.username,
                    isAdmin: response.data.isAdmin
                };
                localStorage.setItem('userData', JSON.stringify(userData));
                
                setIsAuthenticated(true);
            } else {
                debugError('Token não encontrado na resposta:', response.data);
                throw new Error('Token de autenticação não recebido');
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
        withLoading(() => api.post('/Brain/Project', projectData).then(response => response.data)),
    [withLoading]);

    const getLogs = useCallback(() => 
        withLoading(() => api.get('/Brain/Logs').then(response => response.data)),
    [withLoading]);

    const getAssistants = useCallback(() => 
        withLoading(() => api.get('/Gpt/Assistant').then(response => response.data)),
    [withLoading]);

    const updateAssistant = useCallback((id, texto) => 
        withLoading(() => api.put('/Gpt/Assistant', {
            id: id,
            instructions: texto
        }).then(response => response.data)),
    [withLoading]);

    const getInstances = useCallback(() => 
        withLoading(() => api.get('/Wpp/Instances').then(response => response.data)),
    [withLoading]);

    const getChats = useCallback((number, projectId) => 
        withLoading(async () => {
            try {
                const url = projectId ? `/Brain/ChatsByNumber?number=${number}&projectId=${projectId}` : `/Brain/ChatsByNumber?number=${number}`;
                const response = await api.get(url);
                debugLog('Chats recebidos:', response.data);
                return response.data;
            } catch (error) {
                debugError('Erro ao buscar chats:', error);
                throw error;
            }
        }),
    [withLoading]);

    const getChatsControlLog = useCallback((number) => 
        withLoading(() => api.get(`/Brain/ChatsControlLog?number=${number}`).then(response => response.data)),
    [withLoading]);

    const connectInstance = useCallback(({ projectId, instanceName }) => 
        withLoading(() => api.get(`/Wpp/InstanceConnect?project=${projectId}&instanceName=${instanceName}`).then(response => response.data)),
    [withLoading]);

    const getNotifications = useCallback(() => 
        withLoading(() => api.get('/Notification').then(response => response.data)),
    [withLoading]);

    const deleteNotification = useCallback((id) => 
        withLoading(() => api.delete(`/Notification/${id}`).then(response => response.data)),
    [withLoading]);

    const createNotification = useCallback((notificationData) => 
        withLoading(() => api.post('/Notification', notificationData).then(response => response.data)),
    [withLoading]);

    const updateNotification = useCallback((id, notificationData) => 
        withLoading(() => api.put(`/Notification/${id}`, notificationData).then(response => response.data)),
    [withLoading]);
    
    const getSchedules = useCallback(() => 
        withLoading(() => api.get('/Notification/schedule').then(response => response.data)),
    [withLoading]);

    const createSchedule = useCallback((scheduleData) => 
        withLoading(() => api.post('/Notification/schedule', scheduleData).then(response => response.data)),
    [withLoading]);

    const updateSchedule = useCallback((id, scheduleData) => 
        withLoading(() => api.put(`/Notification/schedule/${id}`, scheduleData).then(response => response.data)),
    [withLoading]);

    const deleteSchedule = useCallback((id) => 
        withLoading(() => api.delete(`/Notification/schedule/${id}`).then(response => response.data)),
    [withLoading]);

    const getDashboard = useCallback(() => 
        withLoading(() => api.get('/Dashboard', { headers: { accept: 'text/plain' } }).then(response => response.data)),
    [withLoading]);

    const getChatsNumbers = useCallback((projectId) => 
        withLoading(() => {
            const url = projectId ? `/Brain/Numbers?projectId=${projectId}` : '/Brain/Numbers';
            return api.get(url).then(response => response.data);
        }),
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
        updateAssistant,
        getInstances,
        getChats,
        getChatsNumbers,
        getChatsControlLog,
        connectInstance,
        getNotifications,
        createNotification,
        deleteNotification,
        updateNotification,
        getSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        getDashboard,
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

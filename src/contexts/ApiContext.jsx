// src/contexts/ApiContext.jsx
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';    

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const { setIsAuthenticated } = useAuth(); // Recebe a função para atualizar o estado de autenticação

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

    // Funções para cada endpoint
    const login = async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const token = response.data.token;
        if (token) {
            localStorage.setItem('authToken', token); // Salva o token no localStorage
            setIsAuthenticated(true); // Atualiza o estado de autenticação
        }
        return response.data;
    };

    const getContacts = async () => {
        const response = await api.get('/Wpp/Contacts');
        return response.data;
    };

    const InativeContact = async (contactId) => {
        const response = await api.post(`/Wpp/InativeContact?id=${contactId}`);
        return response.status;
    };
    const AtiveContact = async (contactId) => {
        const response = await api.post(`/Wpp/AtiveContact?id=${contactId}`);
        return response.status;
    };
    
    const getProjects = async () => {
        const response = await api.get('/Brain/Projects');
        return response.data;
    };
    
     const getProjectById = async (projectId) => {
        const response = await api.get(`/Brain/Project?id=${projectId}`);
        return response.data;
    };

    const updateProject = async (projectId, updatedData) => {
        // updatedData.id = projectId;
        var isTrueSet = (updatedData.active === 'true');
        updatedData.active = isTrueSet;
        const response = await api.put(`/Brain/Project`, updatedData);
        return response.data;
    };

    const createProject = async (projectData) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    };

    const getLogs = async () => {
        const response = await api.get('/Brain/Logs');
        return response.data;
    };

    const getAssistants = async () => {
        const response = await api.get('/Gpt/Assistant');
        return response.data;
    };

    const getInstances = async () => {
        const response = await api.get('/Wpp/Instances');
        return response.data;
    };

    const getChats = async () => {
        const response = await api.get('/Brain/Chats');
        return response.data;
    };
    
    return (
        <ApiContext.Provider value={{login,getContacts,InativeContact,AtiveContact,getProjects,getProjectById,updateProject,createProject,getLogs,getAssistants,getInstances,getChats }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook personalizado para usar o ApiContext
export const useApi = () => useContext(ApiContext);

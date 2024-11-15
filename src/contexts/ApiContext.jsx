// src/contexts/ApiContext.jsx
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
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
        return response.data;
    };

    const getContacts = async () => {
        const response = await api.get('/Wpp/Contacts');
        return response.data;
    };

    // Outras funções de API podem ser adicionadas aqui
    // Por exemplo, logout, getUsers, updateUser, etc.

    return (
        <ApiContext.Provider value={{ login, getContacts }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook personalizado para usar o ApiContext
export const useApi = () => useContext(ApiContext);

// src/config.js
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

export const API_BASE_URL = IS_DEVELOPMENT 
    ? 'https://localhost:44309/api'
    : 'https://brainbot-hkdxhqbqe4hgbgb5.brazilsouth-01.azurewebsites.net/api';

// Função auxiliar para logs condicionais
export const debugLog = (...args) => {
    if (IS_DEVELOPMENT) {
        console.log('[DEBUG]', ...args);
    }
};

export const debugError = (...args) => {
    if (IS_DEVELOPMENT) {
        console.error('[ERROR]', ...args);
    }
};

// Função para verificar se a API está acessível
export const checkApiConnection = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            debugError('Token não encontrado ao verificar conexão');
            return false;
        }

        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const response = await fetch(API_BASE_URL + '/Brain/Chats', {
            headers: {
                'Authorization': formattedToken
            }
        });
        return response.ok;
    } catch (error) {
        debugError('Erro ao verificar conexão com a API:', error);
        return false;
    }
};

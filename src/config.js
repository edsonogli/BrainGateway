// src/config.js
export const API_BASE_URL = 'https://localhost:44309/api';
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

// Função auxiliar para logs condicionais
export const debugLog = (...args) => {
    if (IS_DEVELOPMENT) {
        console.log(...args);
    }
};

export const debugError = (...args) => {
    if (IS_DEVELOPMENT) {
        console.error(...args);
    }
};

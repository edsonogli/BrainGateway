// src/config.js
export const API_BASE_URL = 'https://brainbot-hkdxhqbqe4hgbgb5.brazilsouth-01.azurewebsites.net/api';
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

// src/utils/imageUtils.js
import { API_BASE_URL } from '../config';

/**
 * Processa URLs de imagem retornadas pela API
 * @param {string} imageUrl - URL da imagem (pode ser relativa ou absoluta)
 * @returns {string} - URL completa e acessível
 */
export const processImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Se já é uma URL completa (incluindo URLs do WhatsApp, Facebook, etc.), retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Se é uma URL de dados (data:image/...), retorna como está
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Se é uma URL relativa, constrói a URL completa usando a API base
  const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api para acessar arquivos estáticos
  
  // Garante que a URL comece com /
  const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${normalizedUrl}`;
};
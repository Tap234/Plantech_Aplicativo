import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // 1. IMPORTAR O PLATFORM

// Define o host da API de desenvolvimento dependendo da plataforma.
// IMPORTANTE: substitua 'YOUR_COMPUTER_IP' pelo IP da sua máquina na rede
// (ex: 192.168.0.42) se for testar em um dispositivo real.
let host = 'localhost';

if (Platform.OS === 'web') {
  host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
} else {
  // PARA CELULAR FÍSICO (CABO OU WI-FI), USE O IP DO SEU PC:
  host = '192.168.0.86'; // <--- COLOQUE SEU IPV4 AQUI (ex: 20.20.20.113)
}

// Se estiver usando emulador, pode descomentar a linha abaixo:
// if (Platform.OS === 'android') host = '10.0.2.2'; 

const api = axios.create({
  baseURL: `http://${host}:8080/api`,
});

// Log baseURL at startup to help debugging mobile network issues
try {
  // eslint-disable-next-line no-console
  console.log('[api] baseURL =', api.defaults.baseURL);
} catch (e) {}

// Simple request/response logging for troubleshooting
api.interceptors.request.use((cfg) => {
  // eslint-disable-next-line no-console
  console.log('[api] request:', cfg.method, cfg.url);
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // eslint-disable-next-line no-console
    console.log('[api] request error:', err && err.message, err && err.config && err.config.url);
    return Promise.reject(err);
  }
);

// 2. MODIFICAR O INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    let token;
    
    // Verifica a plataforma
    if (Platform.OS === 'web') {
      // Se for web, usa o localStorage do navegador
      token = localStorage.getItem('userToken');
    } else {
      // Se for nativo (iOS/Android), usa o SecureStore
      token = await SecureStore.getItemAsync('userToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
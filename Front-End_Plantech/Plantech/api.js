import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Define o host da API de desenvolvimento dependendo da plataforma.
let host = 'localhost';

if (Platform.OS === 'web') {
  host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
} else {
  // Tenta obter o IP dinamicamente do Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    host = hostUri.split(':')[0];
  } else {
    // Fallback para o IP antigo se não conseguir obter dinamicamente
    host = '192.168.0.86';
  }
}

const api = axios.create({
  baseURL: `http://${host}:8080/api`,
});

// Log baseURL at startup to help debugging mobile network issues
try {
  // eslint-disable-next-line no-console
  console.log('[api] baseURL =', api.defaults.baseURL);
} catch (e) { }

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
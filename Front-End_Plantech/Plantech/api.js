import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // 1. IMPORTAR O PLATFORM

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

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
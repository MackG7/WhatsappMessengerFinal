import axios from 'axios';

// Configuración automática para desarrollo/producción
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment
    ? 'http://localhost:5000/api'
    : 'https://tp-final-integrador-back-end-1.onrender.com/api';

console.log(` Conectando a: ${API_BASE_URL}`);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`API Call: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Error en request:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        console.log(`API Success: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(` API Error: ${error.response?.status || 'NO STATUS'} ${error.config?.url}`, error.message);

        if (error.response?.status === 401) {
            // Token inválido o expirado - limpiar y redirigir
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
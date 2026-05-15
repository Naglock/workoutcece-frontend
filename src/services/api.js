import axios from 'axios';

// Creamos una instancia configurada para apuntar a tu Spring Boot
const api = axios.create({
    baseURL: 'http://localhost:8083/api', // La ruta base del backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// revisamos si hay un token guardado y lo inyectamos automáticamente.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
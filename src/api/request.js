import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
    timeout: 10000
});

// 请求拦截器（添加JWT令牌）
request.interceptors.request.use(config => {
    const token = useAuthStore().token;
    if (token) {
        config.headers.token = token;
    }
    return config;
}, error => Promise.reject(error));

// 响应拦截器（处理错误）
request.interceptors.response.use(
    response => response.data,
    error => {
        const { status, data } = error.response || {};
        if (status === 401) {
            useAuthStore().logout();
        }
        return Promise.reject(error);
    }
);

export default request;
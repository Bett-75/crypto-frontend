import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({ baseURL: `${BASE_URL}/api/v1` });
export const adminApi = axios.create({ baseURL: `${BASE_URL}/api/v1` });

// Attach JWT to every request
[api, adminApi].forEach((instance) => {
  instance.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (res) => res.data,
    (err) => {
      const message = err.response?.data?.message ?? err.message ?? 'Request failed';
      if (err.response?.status === 401) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
      return Promise.reject(new Error(message));
    },
  );
});

import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function makeClient() {
  const instance = axios.create({ baseURL: `${BASE_URL}/api/v1` });
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
  return instance;
}

// Export every name any file might import
export const api = makeClient();
export const authApi = makeClient();
export const userApi = makeClient();
export const adminApi = makeClient();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  referralCode?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Auth API
export const authApi = {
  register: async (data: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  login: async (data: LoginCredentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

// User API
export const userApi = {
  getMe: async (token: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getBalance: async (token: string) => {
    const res = await fetch(`${API_URL}/users/me/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// Admin API - This is what your page is importing
export const adminApi = {
  getUsers: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getDeposits: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/deposits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getWithdrawals: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getAuditLogs: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

export default {
  auth: authApi,
  user: userApi,
  admin: adminApi
};

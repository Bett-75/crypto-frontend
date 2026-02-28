const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Auth API
export const authApi = {
  register: (data: any) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  login: (data: any) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

// User API
export const userApi = {
  getMe: (token: string) => fetch(`${API_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  getBalance: (token: string) => fetch(`${API_URL}/users/me/balance`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
};

// Admin API - This is what your page is importing
export const adminApi = {
  getUsers: (token: string) => fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  getDeposits: (token: string) => fetch(`${API_URL}/admin/deposits`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  getWithdrawals: (token: string) => fetch(`${API_URL}/admin/withdrawals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  getAuditLogs: (token: string) => fetch(`${API_URL}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
};

export default {
  auth: authApi,
  user: userApi,
  admin: adminApi
};

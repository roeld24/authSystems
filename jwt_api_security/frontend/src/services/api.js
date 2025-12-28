import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store per refresh token e callback
let refreshTokenValue = null;
let onTokenRefreshCallback = null;

// Aggiorna header Authorization di default
export const setAccessToken = (token) => {
  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers['Authorization'];
  }
};

export const setRefreshToken = (token) => {
  refreshTokenValue = token;
};

export const setOnTokenRefresh = (callback) => {
  onTokenRefreshCallback = callback;
};

// Interceptor per gestire 401 (token scaduto)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshTokenValue) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refreshTokenValue
        });

        const newTokens = response.data.tokens;

        if (!newTokens?.accessToken) throw new Error('Refresh failed');

        // Chiama la callback per aggiornare il contesto
        if (onTokenRefreshCallback) onTokenRefreshCallback(newTokens);

        // Aggiorna header della richiesta originale
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newTokens.accessToken}`
        };

        return api(originalRequest);
      } catch (refreshError) {
        if (onTokenRefreshCallback) onTokenRefreshCallback(null); // logout
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getJWK: () => api.get('/auth/jwk')
};

// Protected API
export const protectedAPI = {
  // Metodi generici
  get: (url, options) => api.get(url, options),
  post: (url, data, options) => api.post(url, data, options),
  put: (url, data, options) => api.put(url, data, options),
  delete: (url, options) => api.delete(url, options),
  
  // Statistiche
  getStatistics: () => api.get('/customers/statistics'),
  
  // Clienti
  getCustomers: () => api.get('/customers'),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),

  // Cambio password
  changePassword: (data) => api.post('/auth/change-password', data),
  
  // Fatture
  getInvoices: (customerId) => api.get(`/customers/${customerId}/invoices`),
  createInvoice: (customerId, data) => api.post(`/customers/${customerId}/invoices`, data),
  updateInvoice: (customerId, invoiceId, data) => api.put(`/customers/${customerId}/invoices/${invoiceId}`, data),
  deleteInvoice: (customerId, invoiceId) => api.delete(`/customers/${customerId}/invoices/${invoiceId}`),
  
  // Audit Logs (solo manager)
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
  getAuditActions: () => api.get('/audit-logs/actions'),
  getSecurityEvents: (days) => api.get('/audit-logs/security-events', { params: { days } }),
  getEmployeeStats: (employeeId, days) => api.get(`/audit-logs/employee/${employeeId}/stats`, { params: { days } })
};

export default api;
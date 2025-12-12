import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getJWK: () => api.get('/auth/jwk')
};

export const protectedAPI = {
  getJWTProtected: (token) => 
    api.get('/protected/jwt-protected', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getJWSProtected: (token) => 
    api.get('/protected/jws-protected', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getJWEProtected: (token) => 
    api.get('/protected/jwe-protected', {
      headers: { Authorization: `Bearer ${token}` }
    })
};

export default api;

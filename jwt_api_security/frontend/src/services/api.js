import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Crea istanza axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getJWK: () => api.get('/auth/jwk')
};

// Protected APIs
export const protectedAPI = {
  // JWT protected endpoint
  getJWTProtected: (token) => 
    api.get('/protected/jwt-protected', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  // JWS protected endpoint
  getJWSProtected: (token) => 
    api.get('/protected/jws-protected', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  // JWE protected endpoint
  getJWEProtected: (token) => 
    api.get('/protected/jwe-protected', {
      headers: { Authorization: `Bearer ${token}` }
    })
};

export default api;
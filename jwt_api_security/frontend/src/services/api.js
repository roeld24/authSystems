import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

<<<<<<< HEAD
// Store per il refresh token e callback
let refreshTokenValue = null;
let onTokenRefreshCallback = null;

// Configura il refresh token e la callback
export const setRefreshToken = (token) => {
  refreshTokenValue = token;
};

export const setOnTokenRefresh = (callback) => {
  onTokenRefreshCallback = callback;
};

// Interceptor per gestire errori 401 (token scaduto)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se errore 401 e non è già un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token scaduto, tentativo di refresh...');
        
        // Chiama il refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refreshTokenValue
        });

        const newTokens = response.data.tokens;
        
        // Aggiorna i token tramite callback
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(newTokens);
        }

        // Determina quale token usare per la richiesta originale
        let tokenToUse = newTokens.jwt; // default
        
        if (originalRequest.url.includes('jws-protected')) {
          tokenToUse = newTokens.jws;
        } else if (originalRequest.url.includes('jwe-protected')) {
          tokenToUse = newTokens.jwe;
        }

        // Aggiorna l'header della richiesta originale
        originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;

        console.log('✅ Token refreshati con successo!');
        
        // Ritenta la richiesta originale
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Errore durante il refresh:', refreshError);
        
        // Se il refresh fallisce, logout
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(null); // Trigger logout
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
=======
>>>>>>> 3be3a4f7db661db558ba6e1fa22c76954929d301
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

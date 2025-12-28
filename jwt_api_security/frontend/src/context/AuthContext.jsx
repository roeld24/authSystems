import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setRefreshToken, setOnTokenRefresh, setAccessToken, authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Inizializza da localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setTokens({
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken
      });
      setRefreshToken(storedRefreshToken);
      setAccessToken(storedAccessToken);
    }

    setLoading(false);
  }, []);

  // Funzione per decodificare JWT e ottenere exp
  const getTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Converti in millisecondi
    } catch (error) {
      return null;
    }
  };

  // Auto-refresh token prima della scadenza
  const scheduleTokenRefresh = (accessToken, refreshToken) => {
    // Cancella timer precedente
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expirationTime = getTokenExpiration(accessToken);
    if (!expirationTime) return;

    const now = Date.now();
    const timeUntilExpiry = expirationTime - now;
    
    // Refresh 30 secondi prima della scadenza
    const refreshTime = Math.max(timeUntilExpiry - 30000, 0);

    console.log(`⏰ Token expires in ${Math.floor(timeUntilExpiry / 1000)}s, will refresh in ${Math.floor(refreshTime / 1000)}s`);

    // Nella funzione scheduleTokenRefresh, modifica la parte del catch:

refreshTimerRef.current = setTimeout(async () => {
  console.log('🔄 Auto-refreshing token...');
  try {
    const response = await authAPI.refresh(refreshToken);
    
    if (response.data.accessToken) {
      const newAccessToken = response.data.accessToken;
      
      // Aggiorna tokens
      setTokens(prev => ({
        ...prev,
        accessToken: newAccessToken
      }));

      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);

      console.log('✅ Token auto-refreshed successfully');
      
      // Programma il prossimo refresh
      scheduleTokenRefresh(newAccessToken, refreshToken);
    }
  } catch (error) {
    console.error('❌ Auto-refresh failed:', error);
    
    // Se il refresh token è scaduto, fai logout
    if (error.response?.status === 401) {
      console.log('⏰ REFRESH TOKEN SCADUTO - Il refresh token è scaduto dopo il tempo configurato');
      console.log('🚪 Logout automatico in corso...');
      logout();
    }
  }
}, refreshTime);
  };

  // Avvia auto-refresh quando i token cambiano
  useEffect(() => {
    if (tokens.accessToken && tokens.refreshToken) {
      scheduleTokenRefresh(tokens.accessToken, tokens.refreshToken);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [tokens.accessToken, tokens.refreshToken]);

  // Callback per refresh token manuale (da interceptor)
  useEffect(() => {
    setOnTokenRefresh((newTokens) => {
      if (newTokens?.accessToken) {
        setTokens(prev => ({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || prev.refreshToken
        }));

        localStorage.setItem('accessToken', newTokens.accessToken);

        if (newTokens.refreshToken) {
          localStorage.setItem('refreshToken', newTokens.refreshToken);
          setRefreshToken(newTokens.refreshToken);
        }

        setAccessToken(newTokens.accessToken);
        console.log('✅ Tokens refreshed successfully');
      } else {
        logout();
      }
    });
  }, []);

  const login = (userData, userTokens) => {
    setUser(userData);
    setTokens({
      accessToken: userTokens.accessToken,
      refreshToken: userTokens.refreshToken
    });

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', userTokens.accessToken);
    localStorage.setItem('refreshToken', userTokens.refreshToken);

    setRefreshToken(userTokens.refreshToken);
    setAccessToken(userTokens.accessToken);

    console.log('✅ Login successful');
  };

  const logout = () => {
    // Cancella timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    setUser(null);
    setTokens({ accessToken: null, refreshToken: null });

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setRefreshToken(null);
    setAccessToken(null);

    console.log('🚪 Logged out');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const isAuthenticated = () => Boolean(user && tokens.accessToken);

  const getAccessToken = () => tokens.accessToken;

  const value = {
    user,
    tokens,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getAccessToken
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #e0e0e0', borderTop: '5px solid #2196F3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#666' }}>Caricamento...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { setRefreshToken, setOnTokenRefresh } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    jwt: null,
    jws: null,
    jwe: null,
    refreshToken: null
  });

  // Configura l'interceptor quando i token cambiano
  useEffect(() => {
    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken);
      
      // Callback per aggiornare i token dopo il refresh
      setOnTokenRefresh((newTokens) => {
        if (newTokens === null) {
          // Refresh fallito, esegui logout
          logout();
        } else {
          // Aggiorna i token mantenendo il refresh token esistente
          setTokens(prev => ({
            ...newTokens,
            refreshToken: prev.refreshToken
          }));
        }
      });
    }
  }, [tokens.refreshToken]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
  };

  const logout = () => {
    setUser(null);
    setTokens({
      jwt: null,
      jws: null,
      jwe: null,
      refreshToken: null
    });
  };

  const updateTokens = (newTokens) => {
    setTokens(prev => ({
      ...newTokens,
      refreshToken: prev.refreshToken // Mantieni il refresh token esistente
    }));
  };

  const isAuthenticated = () => {
    return user !== null && tokens.jwt !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
      login,
      logout,
      updateTokens,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
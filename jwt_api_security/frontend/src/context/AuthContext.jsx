import React, { createContext, useContext, useState, useEffect } from 'react';
import { setRefreshToken, setOnTokenRefresh, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });
  const [loading, setLoading] = useState(true);

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

  // Callback per refresh token
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
  };

  const logout = () => {
    setUser(null);
    setTokens({ accessToken: null, refreshToken: null });

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setRefreshToken(null);
    setAccessToken(null);
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

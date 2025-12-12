import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used in AuthProvider');
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

  const isAuthenticated = () => {
    return user !== null && tokens.jwt !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

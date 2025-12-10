import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

// Componente per proteggere le route
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

// Home page
function Home() {
  return (
    <div style={styles.home}>
      <div style={styles.hero}>
        <h1>🔐 JWT Security Demo</h1>
        <p style={styles.subtitle}>
          Applicazione dimostrativa per JWT, JWS, JWE e JWK
        </p>
        
        <div style={styles.features}>
          <div style={styles.feature}>
            <h3>🎯 Obiettivo</h3>
            <p>Dimostrare l'uso di diversi tipi di token per la sicurezza delle API</p>
          </div>
          
          <div style={styles.feature}>
            <h3>🔑 Token Supportati</h3>
            <ul style={styles.list}>
              <li>JWT (HS256) - Firma simmetrica</li>
              <li>JWS (RS256) - Firma asimmetrica</li>
              <li>JWE (A256GCM) - Token cifrato</li>
              <li>JWK - Chiave pubblica JSON</li>
            </ul>
          </div>
          
          <div style={styles.feature}>
            <h3>🚀 Come Iniziare</h3>
            <ol style={styles.list}>
              <li>Registrati con username, email e password</li>
              <li>Effettua il login</li>
              <li>Ricevi 4 tipi di token</li>
              <li>Testa gli endpoint protetti</li>
            </ol>
          </div>
        </div>

        <div style={styles.buttons}>
          <a href="/register" style={styles.primaryButton}>
            Inizia Ora
          </a>
          <a href="/login" style={styles.secondaryButton}>
            Ho già un account
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  home: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#282c34',
    color: 'white',
    padding: '2rem'
  },
  hero: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
    paddingTop: '3rem'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#61dafb',
    marginBottom: '3rem'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
    textAlign: 'left'
  },
  feature: {
    backgroundColor: '#1e2127',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #61dafb'
  },
  list: {
    textAlign: 'left',
    lineHeight: '1.8'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  primaryButton: {
    padding: '1rem 2rem',
    backgroundColor: '#61dafb',
    color: '#282c34',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  secondaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: '#61dafb',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    border: '2px solid #61dafb'
  }
};

export default App;
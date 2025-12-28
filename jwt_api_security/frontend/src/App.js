// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Profile from './components/Profile';
import AuditLogs from './components/AuditLogs';
import ChangePassword from './components/ChangePassword';
import './App.css';

// Componente per proteggere le route
function ProtectedRoute({ children, requireManager = false }) {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requireManager && !user?.isManager) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Home page
function Home() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={styles.home}>
            <div style={styles.hero}>
                <div style={styles.heroIcon}>
                    🔐
                </div>
                <h1 style={styles.heroTitle}>Chinook CRM</h1>
                <p style={styles.heroSubtitle}>
                    Sistema CRM sicuro con Security & Privacy by Design
                </p>

                <div style={styles.features}>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>🛡️</div>
                        <h3 style={styles.featureTitle}>Security First</h3>
                        <p style={styles.featureText}>
                            Autenticazione JWT, password hashing con bcrypt, 
                            protezione SQL injection e XSS
                        </p>
                    </div>

                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>🔒</div>
                        <h3 style={styles.featureTitle}>Privacy by Design</h3>
                        <p style={styles.featureText}>
                            Minimizzazione dati, audit logging completo, 
                            conformità GDPR
                        </p>
                    </div>

                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>⚡</div>
                        <h3 style={styles.featureTitle}>Gestione Clienti</h3>
                        <p style={styles.featureText}>
                            Dashboard completa, statistiche real-time, 
                            filtri avanzati e export dati
                        </p>
                    </div>
                </div>

                <div style={styles.techStack}>
                    <h3 style={styles.techTitle}>Stack Tecnologico</h3>
                    <div style={styles.techBadges}>
                        <span style={styles.techBadge}>React</span>
                        <span style={styles.techBadge}>Node.js</span>
                        <span style={styles.techBadge}>Express</span>
                        <span style={styles.techBadge}>MySQL</span>
                        <span style={styles.techBadge}>JWT</span>
                        <span style={styles.techBadge}>bcrypt</span>
                    </div>
                </div>

                <div style={styles.buttons}>
                    <a href="/login" style={styles.primaryButton}>
                        Accedi al Sistema
                    </a>
                </div>

                <div style={styles.info}>
                    <p style={styles.infoText}>
                        📚 Progetto realizzato per il corso "Security & Privacy by Design da Roeld Hoxha e Luca Mazza"
                    </p>
                    <p style={styles.infoText}>
                        🏫 SUPSI DTI - 2025
                    </p>
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
                        <Route path="/login" element={<Login />} />
                        
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="/customers"
                            element={
                                <ProtectedRoute>
                                    <Customers />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/change-password"
                               element={
                                <ProtectedRoute>
                                    <ChangePassword />
                                </ProtectedRoute>} />

                        
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="/logs"
                            element={
                                <ProtectedRoute requireManager={true}>
                                    <AuditLogs />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

const styles = {
    home: {
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    hero: {
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white'
    },
    heroIcon: {
        fontSize: '5rem',
        marginBottom: '1rem',
        animation: 'float 3s ease-in-out infinite'
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
    },
    heroSubtitle: {
        fontSize: '1.5rem',
        marginBottom: '3rem',
        opacity: 0.95
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
    },
    feature: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.3s, box-shadow 0.3s'
    },
    featureIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    featureTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
    },
    featureText: {
        fontSize: '1rem',
        lineHeight: '1.6',
        opacity: 0.9
    },
    techStack: {
        marginBottom: '3rem'
    },
    techTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem'
    },
    techBadges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center'
    },
    techBadge: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        fontWeight: '600',
        fontSize: '1rem'
    },
    buttons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '3rem'
    },
    primaryButton: {
        padding: '1.25rem 3rem',
        backgroundColor: 'white',
        color: '#667eea',
        textDecoration: 'none',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'inline-block'
    },
    info: {
        marginTop: '2rem',
        opacity: 0.9
    },
    infoText: {
        fontSize: '1rem',
        margin: '0.5rem 0'
    }
};

export default App;
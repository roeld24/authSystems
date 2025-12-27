// src/components/TokenInspector.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Copy, Check, Clock, Shield } from 'lucide-react';

function TokenInspector() {
    const { tokens } = useAuth();
    const [showTokens, setShowTokens] = useState(false);
    const [copied, setCopied] = useState('');
    const [decodedToken, setDecodedToken] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        if (tokens.accessToken) {
            try {
                // Decode JWT (base64)
                const parts = tokens.accessToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    setDecodedToken(payload);

                    // Calcola tempo rimanente
                    updateTimeRemaining(payload.exp);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, [tokens.accessToken]);

    useEffect(() => {
        if (decodedToken?.exp) {
            const interval = setInterval(() => {
                updateTimeRemaining(decodedToken.exp);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [decodedToken]);

    const updateTimeRemaining = (exp) => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = exp - now;
        
        if (remaining > 0) {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
            setTimeRemaining('Scaduto');
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString('it-IT');
    };

    if (!tokens.accessToken) {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Shield size={24} color="#2196F3" />
                    <h3 style={styles.title}>Token Inspector</h3>
                </div>
                <button
                    onClick={() => setShowTokens(!showTokens)}
                    style={styles.toggleButton}
                >
                    {showTokens ? (
                        <>
                            <EyeOff size={18} />
                            <span>Nascondi</span>
                        </>
                    ) : (
                        <>
                            <Eye size={18} />
                            <span>Mostra</span>
                        </>
                    )}
                </button>
            </div>

            {/* Token Status */}
            <div style={styles.statusSection}>
                <div style={styles.statusItem}>
                    <Clock size={20} color="#FF9800" />
                    <div>
                        <p style={styles.statusLabel}>Scadenza tra</p>
                        <p style={styles.statusValue}>{timeRemaining}</p>
                    </div>
                </div>
            </div>

            {/* Decoded Payload */}
            {decodedToken && (
                <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Payload Decodificato</h4>
                    <div style={styles.payloadGrid}>
                        <PayloadItem label="User ID" value={decodedToken.userId} />
                        <PayloadItem label="Email" value={decodedToken.email} />
                        <PayloadItem 
                            label="Nome" 
                            value={`${decodedToken.firstName} ${decodedToken.lastName}`} 
                        />
                        <PayloadItem 
                            label="Manager" 
                            value={decodedToken.isManager ? '✅ Sì' : '❌ No'} 
                        />
                        <PayloadItem 
                            label="Issued At" 
                            value={formatDate(decodedToken.iat)} 
                        />
                        <PayloadItem 
                            label="Expires At" 
                            value={formatDate(decodedToken.exp)} 
                        />
                    </div>
                </div>
            )}

            {/* Raw Tokens */}
            {showTokens && (
                <>
                    <div style={styles.section}>
                        <div style={styles.tokenHeader}>
                            <h4 style={styles.sectionTitle}>Access Token (JWT)</h4>
                            <button
                                onClick={() => copyToClipboard(tokens.accessToken, 'access')}
                                style={styles.copyButton}
                            >
                                {copied === 'access' ? (
                                    <>
                                        <Check size={16} />
                                        <span>Copiato!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copia</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div style={styles.tokenBox}>
                            <code style={styles.tokenCode}>
                                {tokens.accessToken}
                            </code>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <div style={styles.tokenHeader}>
                            <h4 style={styles.sectionTitle}>Refresh Token</h4>
                            <button
                                onClick={() => copyToClipboard(tokens.refreshToken, 'refresh')}
                                style={styles.copyButton}
                            >
                                {copied === 'refresh' ? (
                                    <>
                                        <Check size={16} />
                                        <span>Copiato!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copia</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div style={styles.tokenBox}>
                            <code style={styles.tokenCode}>
                                {tokens.refreshToken}
                            </code>
                        </div>
                    </div>
                </>
            )}

            {/* Info */}
            <div style={styles.infoBox}>
                <p style={styles.infoText}>
                    ℹ️ I token JWT contengono informazioni codificate ma <strong>non cifrate</strong>. 
                    Non includere mai dati sensibili nel payload.
                </p>
            </div>
        </div>
    );
}

function PayloadItem({ label, value }) {
    return (
        <div style={styles.payloadItem}>
            <p style={styles.payloadLabel}>{label}</p>
            <p style={styles.payloadValue}>{value}</p>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f0f0f0'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    toggleButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        color: '#555',
        transition: 'all 0.2s'
    },
    statusSection: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    statusItem: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        border: '1px solid #ffe0b2'
    },
    statusLabel: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0 0 0.25rem 0'
    },
    statusValue: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#FF9800',
        margin: 0
    },
    section: {
        marginBottom: '1.5rem'
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 1rem 0'
    },
    payloadGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
    },
    payloadItem: {
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    payloadLabel: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0 0 0.25rem 0',
        fontWeight: '500'
    },
    payloadValue: {
        fontSize: '0.95rem',
        color: '#1a1a1a',
        margin: 0,
        fontWeight: '600'
    },
    tokenHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
    },
    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    },
    tokenBox: {
        backgroundColor: '#1e1e1e',
        padding: '1rem',
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: '150px'
    },
    tokenCode: {
        color: '#4CAF50',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        wordBreak: 'break-all',
        lineHeight: '1.5'
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #90caf9'
    },
    infoText: {
        fontSize: '0.9rem',
        color: '#1976d2',
        margin: 0,
        lineHeight: '1.6'
    }
};

export default TokenInspector;
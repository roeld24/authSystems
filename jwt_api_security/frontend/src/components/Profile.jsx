// src/components/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import TokenInspector from './TokenInspector';
import { 
    User, 
    Lock, 
    CheckCircle, 
    AlertCircle,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';

function Profile() {
    const { user, logout } = useAuth();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChangePassword = async () => {
        setMessage({ type: '', text: '' });

        // Validazione frontend
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Tutti i campi sono obbligatori' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Le nuove password non coincidono' });
            return;
        }

        if (newPassword.length < 6 || newPassword.length > 14) {
            setMessage({ type: 'error', text: 'La password deve essere tra 6 e 14 caratteri' });
            return;
        }

        // Verifica complessità
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasNumbers = /[0-9]/.test(newPassword);
        const hasSpecial = /[-!$#%]/.test(newPassword);

        const categoriesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;

        if (categoriesCount < 3) {
            setMessage({ 
                type: 'error', 
                text: 'La password deve contenere almeno 3 delle seguenti: maiuscole, minuscole, numeri, caratteri speciali' 
            });
            return;
        }

        setLoading(true);

        try {
            await authAPI.changePassword({
                currentPassword,
                newPassword
            });

            setMessage({ 
                type: 'success', 
                text: '✅ Password cambiata con successo! Verrai disconnesso tra 3 secondi...' 
            });

            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Logout dopo 3 secondi
            setTimeout(async () => {
                await logout();
                window.location.href = '/login';
            }, 3000);

        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.error || 'Errore durante il cambio password' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.pageTitle}>
                <User size={32} />
                Profilo Utente
            </h1>

            {/* User Info Card */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <User size={24} color="#2196F3" />
                    <h2 style={styles.cardTitle}>Informazioni Account</h2>
                </div>

                <div style={styles.infoGrid}>
                    <InfoRow label="Nome Completo" value={`${user?.firstName} ${user?.lastName}`} />
                    <InfoRow label="Email" value={user?.email} />
                    <InfoRow label="Titolo" value={user?.title} />
                    <InfoRow 
                        label="Ruolo" 
                        value={
                            <span style={user?.isManager ? styles.badgeManager : styles.badgeEmployee}>
                                {user?.isManager ? '👑 Manager' : '👤 Employee'}
                            </span>
                        } 
                    />
                </div>
            </div>

            {/* Change Password Card */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <Lock size={24} color="#FF9800" />
                    <h2 style={styles.cardTitle}>Cambia Password</h2>
                </div>

                {/* Password Requirements */}
                <div style={styles.requirementsBox}>
                    <div style={styles.requirementsHeader}>
                        <Info size={18} />
                        <span style={styles.requirementsTitle}>Requisiti Password:</span>
                    </div>
                    <ul style={styles.requirementsList}>
                        <li>Lunghezza: <strong>6-14 caratteri</strong></li>
                        <li>Almeno <strong>3 delle seguenti 4 categorie</strong>:</li>
                        <ul style={styles.subList}>
                            <li>Lettere maiuscole (A-Z)</li>
                            <li>Lettere minuscole (a-z)</li>
                            <li>Numeri (0-9)</li>
                            <li>Caratteri speciali (-, !, $, #, %)</li>
                        </ul>
                    </ul>
                </div>

                {/* Message */}
                {message.text && (
                    <div style={message.type === 'error' ? styles.alertError : styles.alertSuccess}>
                        {message.type === 'error' ? (
                            <AlertCircle size={20} />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Form */}
                <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password Corrente</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Password attuale"
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nuova Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Nuova password"
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Conferma Nuova Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Ripeti nuova password"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Show Password Toggle */}
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        style={styles.checkbox}
                    />
                    <Eye size={18} />
                    <span>Mostra password</span>
                </label>

                {/* Submit Button */}
                <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    style={{
                        ...styles.submitButton,
                        ...(loading ? styles.submitButtonDisabled : {})
                    }}
                >
                    {loading ? 'Cambio in corso...' : 'Cambia Password'}
                </button>
            </div>

            {/* Token Inspector */}
            <TokenInspector />
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={styles.infoRow}>
            <span style={styles.infoLabel}>{label}</span>
            <span style={styles.infoValue}>{value}</span>
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: '#f5f5f5'
    },
    pageTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: '2rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '2rem',
        marginBottom: '2rem'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f0f0f0'
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
    },
    infoRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    infoLabel: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    infoValue: {
        fontSize: '1rem',
        fontWeight: '500',
        color: '#1a1a1a'
    },
    badgeManager: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: '#fff3e0',
        color: '#FF9800',
        borderRadius: '16px',
        fontWeight: '600'
    },
    badgeEmployee: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: '#e3f2fd',
        color: '#2196F3',
        borderRadius: '16px',
        fontWeight: '600'
    },
    requirementsBox: {
        backgroundColor: '#e3f2fd',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #90caf9'
    },
    requirementsHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem'
    },
    requirementsTitle: {
        fontWeight: '600',
        color: '#1976d2'
    },
    requirementsList: {
        margin: '0.5rem 0 0 1.5rem',
        color: '#1976d2',
        lineHeight: '1.8'
    },
    subList: {
        marginTop: '0.5rem',
        marginLeft: '1rem'
    },
    alertError: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #ef5350'
    },
    alertSuccess: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #66bb6a'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#555'
    },
    input: {
        padding: '0.75rem',
        fontSize: '1rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        transition: 'border-color 0.3s'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        cursor: 'pointer',
        color: '#555'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    submitButtonDisabled: {
        backgroundColor: '#90caf9',
        cursor: 'not-allowed'
    }
};

export default Profile;
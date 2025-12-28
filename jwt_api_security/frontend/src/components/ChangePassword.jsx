import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { protectedAPI } from '../services/api';
import { KeyRound, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function ChangePassword() {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    const passwordRequirements = {
        minLength: 6,
        maxLength: 14,
        categories: [
            { name: 'Lettere maiuscole (A-Z)', test: /[A-Z]/ },
            { name: 'Lettere minuscole (a-z)', test: /[a-z]/ },
            { name: 'Numeri (0-9)', test: /[0-9]/ },
            { name: 'Caratteri speciali (-, !, $, #, %)', test: /[-!$#%]/ }
        ]
    };

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < passwordRequirements.minLength) {
            errors.push(`Minimo ${passwordRequirements.minLength} caratteri`);
        }
        if (password.length > passwordRequirements.maxLength) {
            errors.push(`Massimo ${passwordRequirements.maxLength} caratteri`);
        }

        const categoriesSoddisfatte = passwordRequirements.categories.filter(
            cat => cat.test.test(password)
        ).length;

        if (categoriesSoddisfatte < 3) {
            errors.push('Deve contenere almeno 3 delle 4 categorie richieste');
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        
        if (name === 'newPassword') {
            setValidationErrors(validatePassword(value));
        }
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('La nuova password deve essere diversa da quella attuale');
            return;
        }

        const errors = validatePassword(formData.newPassword);
        if (errors.length > 0) {
            setError('La password non soddisfa i requisiti');
            return;
        }

        try {
            setLoading(true);
            await protectedAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            setTimeout(() => {
                logout();
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.error || 'Errore durante il cambio password');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryStatus = (category) => {
        return category.test.test(formData.newPassword);
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <CheckCircle size={64} color="#4CAF50" />
                    <h2 style={styles.successTitle}>Password Cambiata!</h2>
                    <p style={styles.successText}>
                        La tua password è stata cambiata con successo.
                        Verrai reindirizzato alla pagina di login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <KeyRound size={32} color="#2196F3" />
                    <h2 style={styles.title}>Cambia Password</h2>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Password Corrente */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password Corrente</label>
                        <div style={styles.passwordInput}>
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('current')}
                                style={styles.eyeButton}
                            >
                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Nuova Password */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Nuova Password</label>
                        <div style={styles.passwordInput}>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('new')}
                                style={styles.eyeButton}
                            >
                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Conferma Password */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Conferma Nuova Password</label>
                        <div style={styles.passwordInput}>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('confirm')}
                                style={styles.eyeButton}
                            >
                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Requisiti Password */}
                    <div style={styles.requirements}>
                        <h4 style={styles.requirementsTitle}>Requisiti Password:</h4>
                        <ul style={styles.requirementsList}>
                            <li style={styles.requirementItem}>
                                {formData.newPassword.length >= passwordRequirements.minLength && 
                                 formData.newPassword.length <= passwordRequirements.maxLength ? 
                                    <CheckCircle size={16} color="#4CAF50" /> : 
                                    <XCircle size={16} color="#d32f2f" />
                                }
                                <span>Tra {passwordRequirements.minLength} e {passwordRequirements.maxLength} caratteri</span>
                            </li>
                            {passwordRequirements.categories.map((cat, idx) => (
                                <li key={idx} style={styles.requirementItem}>
                                    {getCategoryStatus(cat) ? 
                                        <CheckCircle size={16} color="#4CAF50" /> : 
                                        <XCircle size={16} color="#d32f2f" />
                                    }
                                    <span>{cat.name}</span>
                                </li>
                            ))}
                            <li style={styles.requirementItem}>
                                {passwordRequirements.categories.filter(cat => getCategoryStatus(cat)).length >= 3 ? 
                                    <CheckCircle size={16} color="#4CAF50" /> : 
                                    <XCircle size={16} color="#d32f2f" />
                                }
                                <span>Almeno 3 delle 4 categorie sopra</span>
                            </li>
                        </ul>
                    </div>

                    <button 
                        type="submit" 
                        style={styles.submitButton}
                        disabled={loading || validationErrors.length > 0}
                    >
                        {loading ? 'Cambio in corso...' : 'Cambia Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#f5f5f5'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '100%'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    errorAlert: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#ffebee',
        color: '#d32f2f',
        borderRadius: '8px',
        marginBottom: '1.5rem'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#555'
    },
    passwordInput: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        paddingRight: '3rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    eyeButton: {
        position: 'absolute',
        right: '0.75rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center'
    },
    requirements: {
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px'
    },
    requirementsTitle: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#555',
        marginBottom: '0.75rem'
    },
    requirementsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    requirementItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#666'
    },
    submitButton: {
        padding: '1rem',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.3s',
        marginTop: '1rem'
    },
    successCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '400px'
    },
    successTitle: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: '1rem',
        marginBottom: '0.5rem'
    },
    successText: {
        color: '#666',
        fontSize: '1rem',
        lineHeight: '1.6'
    }
};

export default ChangePassword;
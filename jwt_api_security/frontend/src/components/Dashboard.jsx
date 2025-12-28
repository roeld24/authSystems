// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { protectedAPI } from '../services/api';
import { 
    Users, 
    DollarSign, 
    FileText, 
    TrendingUp, 
    Globe,
    Award,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStatistics();
    }, []);

   const loadStatistics = async () => {
    try {
        setLoading(true);
        setError('');
        console.log('Chiamata API statistiche...'); // Debug
        const response = await protectedAPI.getStatistics();
        console.log('Risposta:', response.data); // Debug
        setStats(response.data);
    } catch (err) {
        console.error('Errore completo:', err); // Debug dettagliato
        console.error('Risposta errore:', err.response); // Debug response
        setError(err.response?.data?.error || err.message || 'Errore caricamento statistiche');
    } finally {
        setLoading(false);
    }
};

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Caricamento statistiche...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <AlertCircle size={48} color="#d32f2f" />
                <h2 style={styles.errorTitle}>Errore</h2>
                <p style={styles.errorText}>{error}</p>
                <button onClick={loadStatistics} style={styles.retryButton}>
                    <RefreshCw size={18} />
                    Riprova
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Welcome Section */}
            <div style={styles.welcomeSection}>
                <div>
                    <h1 style={styles.title}>
                        Benvenuto, {user?.firstName}! 👋
                    </h1>
                    <p style={styles.subtitle}>
                        {user?.isManager 
                            ? 'Dashboard completa di tutti i clienti'
                            : 'Dashboard dei tuoi clienti'}
                    </p>
                </div>
                <div style={styles.badge}>
                    {user?.isManager ? '👑 Manager' : '👤 Employee'}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <StatCard
                    icon={<Users size={28} />}
                    label="Clienti Totali"
                    value={stats?.totalCustomers || 0}
                    color="#2196F3"
                    bgColor="#e3f2fd"
                />
                <StatCard
                    icon={<Globe size={28} />}
                    label="Paesi"
                    value={stats?.totalCountries || 0}
                    color="#4CAF50"
                    bgColor="#e8f5e9"
                />
                <StatCard
                    icon={<FileText size={28} />}
                    label="Fatture"
                    value={stats?.totalInvoices || 0}
                    color="#9C27B0"
                    bgColor="#f3e5f5"
                />
                <StatCard
                    icon={<DollarSign size={28} />}
                    label="Fatturato Totale"
                    value={`$${(stats?.totalRevenue || 0).toFixed(2)}`}
                    color="#FF9800"
                    bgColor="#fff3e0"
                />
            </div>

            {/* Average Invoice */}
            <div style={styles.infoCard}>
                <TrendingUp size={24} color="#2196F3" />
                <div>
                    <p style={styles.infoLabel}>Valore Medio Fattura</p>
                    <p style={styles.infoValue}>
                        ${(stats?.avgInvoiceValue || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Top Customers */}
            {stats?.topCustomers && stats.topCustomers.length > 0 && (
                <div style={styles.topCustomersSection}>
                    <div style={styles.sectionHeader}>
                        <Award size={24} color="#FF9800" />
                        <h2 style={styles.sectionTitle}>Top 5 Clienti</h2>
                    </div>

                    <div style={styles.customersList}>
                        {stats.topCustomers.map((customer, index) => (
                            <div key={customer.id} style={styles.customerCard}>
                                <div style={styles.customerRank}>
                                    <span style={{
                                        ...styles.rankBadge,
                                        backgroundColor: getRankColor(index)
                                    }}>
                                        #{index + 1}
                                    </span>
                                </div>

                                <div style={styles.customerInfo}>
                                    <p style={styles.customerName}>{customer.name}</p>
                                    <p style={styles.customerEmail}>{customer.email}</p>
                                </div>

                                <div style={styles.customerStats}>
                                    <div style={styles.statItem}>
                                        <p style={styles.statLabel}>Fatture</p>
                                        <p style={styles.statValue}>{customer.invoiceCount}</p>
                                    </div>
                                    <div style={styles.statItem}>
                                        <p style={styles.statLabel}>Totale</p>
                                        <p style={{
                                            ...styles.statValue,
                                            color: '#4CAF50',
                                            fontWeight: 'bold'
                                        }}>
                                            ${customer.totalSpent.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <h3 style={styles.quickActionsTitle}>Azioni Rapide</h3>
                <div style={styles.actionsGrid}>
                    <ActionButton
                        icon={<Users size={20} />}
                        label="Visualizza Clienti"
                        onClick={() => window.location.href = '/customers'}
                    />
                    <ActionButton
                        icon={<FileText size={20} />}
                        label="Report"
                        onClick={() => alert('Funzionalità in sviluppo')}
                    />
                    {user?.isManager && (
                        <ActionButton
                            icon={<Award size={20} />}
                            label="Audit Logs"
                            onClick={() => window.location.href = '/logs'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Componente StatCard
function StatCard({ icon, label, value, color, bgColor }) {
    return (
        <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: bgColor, color }}>
                {icon}
            </div>
            <div style={styles.statContent}>
                <p style={styles.statLabel}>{label}</p>
                <p style={styles.statValue}>{value}</p>
            </div>
        </div>
    );
}

// Componente ActionButton
function ActionButton({ icon, label, onClick }) {
    return (
        <button onClick={onClick} style={styles.actionButton}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

// Helper per colore rank
function getRankColor(index) {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4CAF50', '#2196F3'];
    return colors[index] || '#9E9E9E';
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: '#f5f5f5'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        gap: '1rem'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #e0e0e0',
        borderTop: '5px solid #2196F3',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        color: '#666',
        fontSize: '1rem'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        gap: '1rem',
        padding: '2rem'
    },
    errorTitle: {
        color: '#d32f2f',
        fontSize: '1.5rem',
        margin: 0
    },
    errorText: {
        color: '#666',
        textAlign: 'center'
    },
    retryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        marginTop: '1rem'
    },
    welcomeSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: '0 0 0.5rem 0'
    },
    subtitle: {
        color: '#666',
        fontSize: '1rem',
        margin: 0
    },
    badge: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#e3f2fd',
        color: '#2196F3',
        borderRadius: '24px',
        fontWeight: '600',
        fontSize: '1rem'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    statIcon: {
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statContent: {
        flex: 1
    },
    statLabel: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0 0 0.25rem 0'
    },
    statValue: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    infoCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
    },
    infoLabel: {
        fontSize: '0.9rem',
        color: '#666',
        margin: '0 0 0.25rem 0'
    },
    infoValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2196F3',
        margin: 0
    },
    topCustomersSection: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    customersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    customerCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    customerRank: {
        flex: '0 0 auto'
    },
    rankBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    customerInfo: {
        flex: 1
    },
    customerName: {
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 0.25rem 0'
    },
    customerEmail: {
        fontSize: '0.85rem',
        color: '#666',
        margin: 0
    },
    customerStats: {
        display: 'flex',
        gap: '2rem'
    },
    statItem: {
        textAlign: 'right'
    },
    quickActions: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    quickActionsTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: '1rem'
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        color: '#555',
        transition: 'all 0.2s'
    }
};

export default Dashboard;
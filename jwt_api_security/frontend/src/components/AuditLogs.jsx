import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { protectedAPI } from '../services/api';

function AuditLogs() {
    const { user } = useAuth();

    const [logs, setLogs] = useState([]);
    const [actions, setActions] = useState([]);
    const [filters, setFilters] = useState({
        employeeId: '',
        action: '',
        dateFrom: '',
        dateTo: '',
        limit: 100,
        offset: 0
    });

    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* =========================
       FETCH ACTIONS
    ========================= */
    const fetchActions = useCallback(async () => {
        try {
            const res = await protectedAPI.getAuditActions();
            setActions(res.data.actions ?? []);
        } catch (err) {
            console.error('Errore fetching actions:', err);
            console.error('Error details:', err.response?.data);
            setError('Errore caricamento azioni');
        }
    }, []);

    /* =========================
       FETCH LOGS
    ========================= */
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            console.log('=== FETCHING AUDIT LOGS ===');
            console.log('User:', user);
            console.log('Filters:', filters);
            console.log('API URL:', '/audit-logs');
            
            const res = await protectedAPI.getAuditLogs(filters);
            
            console.log('Response status:', res.status);
            console.log('Response data:', res.data);

            setLogs(res.data.logs ?? []);
            setTotal(res.data.total ?? 0);
            
            console.log('Logs set successfully. Count:', res.data.logs?.length || 0);
        } catch (err) {
            console.error('=== ERROR FETCHING LOGS ===');
            console.error('Error object:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);
            console.error('Error response status:', err.response?.status);
            console.error('Error message:', err.message);

            if (err.response?.status === 403) {
                setError('Accesso negato: solo i manager possono visualizzare gli audit logs');
            } else if (err.response?.status === 401) {
                setError('Sessione scaduta. Effettua di nuovo il login.');
            } else {
                const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message || 'Errore caricamento logs';
                setError(`Errore: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    }, [filters, user]);

    /* =========================
       EFFECTS
    ========================= */
    useEffect(() => {
        if (!user?.isManager) return;

        fetchActions();
    }, [user, fetchActions]);

    useEffect(() => {
        if (!user?.isManager) return;

        fetchLogs();
    }, [filters, user, fetchLogs]);

    /* =========================
       HANDLERS
    ========================= */
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            offset: 0
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            employeeId: '',
            action: '',
            dateFrom: '',
            dateTo: '',
            limit: 100,
            offset: 0
        });
    };

    const handleNextPage = () => {
        setFilters(prev => ({
            ...prev,
            offset: prev.offset + prev.limit
        }));
    };

    const handlePrevPage = () => {
        setFilters(prev => ({
            ...prev,
            offset: Math.max(0, prev.offset - prev.limit)
        }));
    };

    /* =========================
       ACCESS CONTROL
    ========================= */
    if (!user?.isManager) {
        return (
            <div style={styles.container}>
                <div style={styles.errorCard}>
                    <h2 style={styles.errorTitle}>Accesso negato</h2>
                    <p>Solo i manager possono visualizzare gli audit logs.</p>
                </div>
            </div>
        );
    }

    /* =========================
       RENDER
    ========================= */
    return (
        <div style={styles.container}>
            <h2>Audit Logs</h2>
            <p>Totale: {total}</p>

            {error && <div style={styles.errorAlert}>{error}</div>}

            {/* FILTRI */}
            <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
                <input
                    name="employeeId"
                    placeholder="Employee ID"
                    value={filters.employeeId}
                    onChange={handleFilterChange}
                    style={styles.input}
                />

                <select
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">Tutte le azioni</option>
                    {actions.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>

                <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    style={styles.input}
                />

                <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>Filtra</button>
                <button type="button" onClick={handleClearFilters} style={styles.buttonSecondary}>
                    Pulisci
                </button>
            </form>

            {/* CONTENUTO */}
            {loading ? (
                <p>Caricamento...</p>
            ) : logs.length === 0 ? (
                <p>Nessun log trovato</p>
            ) : (
                <>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Employee</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Azione</th>
                                    <th style={styles.th}>Dettagli</th>
                                    <th style={styles.th}>IP</th>
                                    <th style={styles.th}>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} style={styles.tr}>
                                        <td style={styles.td}>{log.id}</td>
                                        <td style={styles.td}>{log.employeeName ?? 'N/A'}</td>
                                        <td style={styles.td}>{log.employeeEmail ?? 'N/A'}</td>
                                        <td style={styles.td}>{log.action}</td>
                                        <td style={styles.td}>{log.details ?? '-'}</td>
                                        <td style={styles.td}>{log.ipAddress ?? '-'}</td>
                                        <td style={styles.td}>
                                            {log.createdAt
                                                ? new Date(log.createdAt).toLocaleString('it-IT')
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINAZIONE */}
                    <div style={styles.pagination}>
                        <button
                            onClick={handlePrevPage}
                            disabled={filters.offset === 0}
                            style={{
                                ...styles.button,
                                ...(filters.offset === 0 ? styles.buttonDisabled : {})
                            }}
                        >
                            ← Precedente
                        </button>

                        <span style={styles.pageInfo}>
                            {filters.offset + 1} –{' '}
                            {Math.min(filters.offset + filters.limit, total)} di {total}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={filters.offset + filters.limit >= total}
                            style={{
                                ...styles.button,
                                ...(filters.offset + filters.limit >= total ? styles.buttonDisabled : {})
                            }}
                        >
                            Successivo →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    container: { 
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    errorAlert: { 
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    errorCard: { 
        padding: '2rem',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    errorTitle: { 
        color: '#dc3545',
        marginBottom: '1rem'
    },
    filterForm: { 
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    input: {
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    select: {
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    buttonSecondary: {
        padding: '0.5rem 1rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
        opacity: 0.6
    },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '1.5rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    th: {
        backgroundColor: '#f8f9fa',
        padding: '0.75rem',
        textAlign: 'left',
        borderBottom: '2px solid #dee2e6',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    td: {
        padding: '0.75rem',
        borderBottom: '1px solid #dee2e6',
        fontSize: '14px'
    },
    tr: {
        ':hover': {
            backgroundColor: '#f8f9fa'
        }
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1.5rem'
    },
    pageInfo: {
        fontSize: '14px',
        color: '#6c757d'
    }
};

export default AuditLogs;
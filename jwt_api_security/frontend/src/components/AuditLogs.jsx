import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function AuditLogs() {
    const { getAccessToken } = useAuth();
    const [logs, setLogs] = useState([]);
    const [actions, setActions] = useState([]);
    const [filters, setFilters] = useState({
        employeeId: '',
        action: '',
        dateFrom: '',
        dateTo: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Configura axios con JWT
    const api = axios.create({
        baseURL: '/api/audit-logs',
        headers: {
            Authorization: `Bearer ${getAccessToken()}`
        }
    });

    useEffect(() => {
        fetchActions();
        fetchLogs();
    }, []);

    // Fetch lista azioni disponibili
    const fetchActions = async () => {
        try {
            const res = await api.get('/actions');
            setActions(res.data.actions || []);
        } catch (err) {
            console.error('Errore fetching actions:', err);
            setError('Errore caricamento azioni');
        }
    };

    // Fetch logs con filtri
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) params[key] = filters[key];
            });

            const res = await api.get('/', { params });
            setLogs(res.data.logs || []);
            setLoading(false);
        } catch (err) {
            console.error('Errore fetching logs:', err);
            setError('Errore caricamento logs');
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Audit Logs</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleFilterSubmit} style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    name="employeeId"
                    placeholder="Employee ID"
                    value={filters.employeeId}
                    onChange={handleFilterChange}
                    style={{ marginRight: '0.5rem' }}
                />
                <select name="action" value={filters.action} onChange={handleFilterChange}>
                    <option value="">All actions</option>
                    {actions.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
                />
                <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    style={{ marginRight: '0.5rem' }}
                />
                <button type="submit">Filtra</button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Email</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.id}</td>
                                <td>{log.employeeName}</td>
                                <td>{log.employeeEmail}</td>
                                <td>{log.Action}</td>
                                <td>{log.Details}</td>
                                <td>{log.IpAddress}</td>
                                <td>{new Date(log.CreatedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AuditLogs;

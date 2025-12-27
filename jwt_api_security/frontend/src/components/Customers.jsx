// src/components/Customers.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { protectedAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Customers() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ limit: 50, offset: 0 });

    // fetchCustomers avvolta in useCallback
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search: searchTerm,
                limit: filters.limit,
                offset: filters.offset
            };

            if (!user?.isManager) {
                params.employeeId = user.id;
            }

            const res = await protectedAPI.get('/customers', { params });
            setCustomers(res.data || []);
        } catch (err) {
            console.error('Errore fetch clienti:', err);
            setError('Errore caricamento clienti');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters, user]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleNextPage = () => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    const handlePrevPage = () => setFilters(prev => ({ ...prev, offset: Math.max(prev.offset - prev.limit, 0) }));

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Elenco Clienti</h2>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Cerca clienti..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ padding: '0.5rem', width: '300px' }}
                />
            </div>

            {loading && <p>Caricamento clienti...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Nome</th>
                            <th style={thStyle}>Cognome</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Telefono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.CustomerId}>
                                <td style={tdStyle}>{c.CustomerId}</td>
                                <td style={tdStyle}>{c.FirstName}</td>
                                <td style={tdStyle}>{c.LastName}</td>
                                <td style={tdStyle}>{c.Email}</td>
                                <td style={tdStyle}>{c.Phone}</td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan="5" style={tdStyle}>Nessun cliente trovato</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button onClick={handlePrevPage} disabled={filters.offset === 0}>Indietro</button>
                <button onClick={handleNextPage} disabled={customers.length < filters.limit}>Avanti</button>
            </div>
        </div>
    );
}

const thStyle = {
    borderBottom: '2px solid #ccc',
    textAlign: 'left',
    padding: '0.5rem'
};

const tdStyle = {
    borderBottom: '1px solid #eee',
    padding: '0.5rem'
};

export default Customers;

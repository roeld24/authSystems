import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { protectedAPI } from '../services/api';
import TokenInspector from './TokenInspector';

function Dashboard() {
    const { user, tokens } = useAuth();
    const [responses, setResponses] = useState({
        jwt: null,
        jws: null,
        jwe: null
    });
    const [errors, setErrors] = useState({
        jwt: null,
        jws: null,
        jwe: null
    });
    const [loading, setLoading] = useState({
        jwt: false,
        jws: false,
        jwe: false
    });

    const testEndpoint = async (type) => {
        setLoading({ ...loading, [type]: true });
        setErrors({ ...errors, [type]: null });
        setResponses({ ...responses, [type]: null });

        try {
            let response;

            switch (type) {
                case 'jwt':
                    response = await protectedAPI.getJWTProtected(tokens.jwt);
                    break;
                case 'jws':
                    response = await protectedAPI.getJWSProtected(tokens.jws);
                    break;
                case 'jwe':
                    response = await protectedAPI.getJWEProtected(tokens.jwe);
                    break;
                default:
                    throw new Error('Invalid token type');
            }

            setResponses({ ...responses, [type]: response.data });
        } catch (err) {
            setErrors({
                ...errors,
                [type]: err.response?.data?.error || 'Request error'
            });
        } finally {
            setLoading({ ...loading, [type]: false });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <h2>Dashboard</h2>
                <p>Benvenuto, <strong>{user?.username}</strong>!</p>

                {/* Token Inspector Section */}
                <div style={styles.section}>
                    <h3>🔑 I Tuoi Token</h3>
                    <p style={styles.info}>
                        Dopo il login hai ricevuto 4 diversi tipi di token.
                        Puoi decodificarli per vedere il payload (tranne JWE che è cifrato).
                    </p>

                    {tokens.jwt && <TokenInspector token={tokens.jwt} type="JWT" />}
                    {tokens.jws && <TokenInspector token={tokens.jws} type="JWS" />}
                    {tokens.jwe && <TokenInspector token={tokens.jwe} type="JWE" />}
                </div>

                {/* Protected Endpoints Section */}
                <div style={styles.section}>
                    <h3>🔒 Test Endpoint Protetti</h3>
                    <p style={styles.info}>
                        Ogni bottone testa un endpoint protetto usando un tipo diverso di token.
                    </p>

                    {/* JWT Test */}
                    <div style={styles.testCard}>
                        <div style={styles.testHeader}>
                            <h4>JWT (HS256 - Symmetric)</h4>
                            <button
                                onClick={() => testEndpoint('jwt')}
                                disabled={loading.jwt}
                                style={styles.testButton}
                            >
                                {loading.jwt ? 'Loading...' : 'Test JWT Endpoint'}
                            </button>
                        </div>

                        {errors.jwt && (
                            <div style={styles.error}>{errors.jwt}</div>
                        )}

                        {responses.jwt && (
                            <div style={styles.success}>
                                <strong>Response:</strong>
                                <pre>{JSON.stringify(responses.jwt, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    {/* JWS Test */}
                    <div style={styles.testCard}>
                        <div style={styles.testHeader}>
                            <h4>JWS (RS256 - Asymmetric)</h4>
                            <button
                                onClick={() => testEndpoint('jws')}
                                disabled={loading.jws}
                                style={styles.testButton}
                            >
                                {loading.jws ? 'Loading...' : 'Test JWS Endpoint'}
                            </button>
                        </div>

                        {errors.jws && (
                            <div style={styles.error}>{errors.jws}</div>
                        )}

                        {responses.jws && (
                            <div style={styles.success}>
                                <strong>Response:</strong>
                                <pre>{JSON.stringify(responses.jws, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    {/* JWE Test */}
                    <div style={styles.testCard}>
                        <div style={styles.testHeader}>
                            <h4>JWE (A256GCM - Encrypted)</h4>
                            <button
                                onClick={() => testEndpoint('jwe')}
                                disabled={loading.jwe}
                                style={styles.testButton}
                            >
                                {loading.jwe ? 'Loading...' : 'Test JWE Endpoint'}
                            </button>
                        </div>

                        {errors.jwe && (
                            <div style={styles.error}>{errors.jwe}</div>
                        )}

                        {responses.jwe && (
                            <div style={styles.success}>
                                <strong>Response:</strong>
                                <pre>{JSON.stringify(responses.jwe, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Token Info Section */}
                <div style={styles.section}>
                    <h3>Tokens</h3>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h4>JWT (HS256)</h4>
                            <ul>
                                <li>Symmetric signature (same secret)</li>
                                <li>Faster</li>
                                <li>Visible payload (base64)</li>
                                <li>Used for internal API</li>
                            </ul>
                        </div>

                        <div style={styles.infoCard}>
                            <h4>JWS (RS256)</h4>
                            <ul>
                                <li>Asymmetric signature (public/private key)</li>
                                <li>More secure</li>
                                <li>Visible payload</li>
                                <li>Used for public API</li>
                            </ul>
                        </div>

                        <div style={styles.infoCard}>
                            <h4>JWE (A256GCM)</h4>
                            <ul>
                                <li>Encrypted payload</li>
                                <li>Maximum security</li>
                                <li>Non-visible payload</li>
                                <li>For sensitive data</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f5f5f5',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    section: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    info: {
        color: '#666',
        marginBottom: '1rem'
    },
    testCard: {
        backgroundColor: '#f9f9f9',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #ddd'
    },
    testHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    testButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#61dafb',
        color: '#282c34',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem'
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
    },
    infoCard: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ddd'
    }
};

export default Dashboard;

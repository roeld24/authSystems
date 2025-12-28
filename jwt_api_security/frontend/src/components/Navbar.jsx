import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound } from 'lucide-react';

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    JWT Security Demo
                </Link>

                <div style={styles.links}>
                    {!isAuthenticated() ? (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                            <Link to="/customers" style={styles.link}>Clienti</Link>
                            {user?.isManager && (
                                <Link to="/logs" style={styles.link}>Audit Logs</Link>
                            )}
                            <Link to="/change-password" style={styles.link}>
                                <KeyRound size={18} style={{ marginRight: '0.5rem' }} />
                                Cambia Password
                            </Link>
                            <span style={styles.user}>
                                {user?.firstName} {user?.lastName}
                            </span>
                            <button onClick={logout} style={styles.button}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        backgroundColor: '#282c34',
        padding: '1rem 2rem',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none'
    },
    links: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'background 0.3s',
        display: 'flex',
        alignItems: 'center'
    },
    user: {
        marginLeft: '1rem',
        color: '#61dafb',
        fontWeight: '500'
    },
    button: {
        backgroundColor: '#61dafb',
        color: '#282c34',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.3s'
    }
};

export default Navbar;
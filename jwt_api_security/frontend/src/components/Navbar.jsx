import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
                            <span style={styles.user}>{user?.username}</span>
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
        color: 'white'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
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
        transition: 'background 0.3s'
    },
    user: {
        marginLeft: '1rem',
        color: '#61dafb'
    },
    button: {
        backgroundColor: '#61dafb',
        color: '#282c34',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

<<<<<<< HEAD
function TokenInspector({ token, type, keepDecoded, onDecodedChange }) {
  const [decoded, setDecoded] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Quando il token cambia e keepDecoded è true, decodifica automaticamente
  useEffect(() => {
    if (keepDecoded && token) {
      decodeToken();
    }
  }, [token, keepDecoded]);

  const decodeToken = () => {
    try {
      if (type === 'JWE') {
        setDecoded({ message: 'JWE è cifrato, il payload non è visibile!' });
      } else {
        const decodedToken = jwtDecode(token);
        setDecoded(decodedToken);
      }
      setIsExpanded(true);
      if (onDecodedChange) {
        onDecodedChange(true);
      }
    } catch (err) {
      setDecoded({ error: 'Errore nella decodifica' });
      setIsExpanded(true);
    }
  };

  const handleDecode = () => {
    if (isExpanded) {
      // Collassa
      setIsExpanded(false);
      setDecoded(null);
      if (onDecodedChange) {
        onDecodedChange(false);
      }
    } else {
      // Espandi e decodifica
      decodeToken();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>{type} Token</h4>
        <button onClick={handleDecode} style={styles.button}>
          {isExpanded ? '🔼 Nascondi' : '🔽 Decodifica'} {type}
        </button>
      </div>
      
      <div style={styles.tokenBox}>
        <small>{token?.substring(0, 50)}...</small>
      </div>
      
      {isExpanded && decoded && (
        <div style={styles.decodedContainer}>
          <div style={styles.decodedHeader}>
            <strong>📄 Payload Decodificato:</strong>
            {type !== 'JWE' && (
              <span style={styles.refreshBadge}>✅ Aggiornato</span>
            )}
          </div>
          <pre style={styles.decoded}>
            {JSON.stringify(decoded, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f9f9f9',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #ddd'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  title: {
    margin: 0
  },
  tokenBox: {
    backgroundColor: 'white',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginBottom: '0.5rem',
    overflowX: 'auto'
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  decodedContainer: {
    marginTop: '1rem',
    animation: 'slideDown 0.3s ease-out'
  },
  decodedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  refreshBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  decoded: {
    backgroundColor: '#282c34',
    color: '#61dafb',
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    margin: 0
  }
=======
function TokenInspector({ token, type }) {
    const [decoded, setDecoded] = useState(null);

    const handleDecode = () => {
        try {
            if (type === 'JWE') {
                setDecoded({ message: 'JWE token has encrypted payload' });
            } else {
                const decodedToken = jwtDecode(token);
                setDecoded(decodedToken);
            }
        } catch (err) {
            setDecoded({ error: 'Decode error' });
        }
    };

    return (
        <div style={styles.container}>
            <h4>{type} Token</h4>

            <div style={styles.tokenBox}>
                <small>{token?.substring(0, 50)}...</small>
            </div>

            <button onClick={handleDecode} style={styles.button}>
                Decoded {type}
            </button>

            {decoded && (
                <pre style={styles.decoded}>
                    {JSON.stringify(decoded, null, 2)}
                </pre>
            )}
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
    },
    tokenBox: {
        backgroundColor: 'white',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '0.5rem',
        overflowX: 'auto'
    },
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#61dafb',
        color: '#282c34',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    decoded: {
        backgroundColor: '#282c34',
        color: '#61dafb',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem',
        overflow: 'auto'
    }
>>>>>>> 3be3a4f7db661db558ba6e1fa22c76954929d301
};

export default TokenInspector;

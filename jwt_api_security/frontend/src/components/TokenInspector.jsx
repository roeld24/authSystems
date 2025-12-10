import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function TokenInspector({ token, type }) {
  const [decoded, setDecoded] = useState(null);

  const handleDecode = () => {
    try {
      if (type === 'JWE') {
        setDecoded({ message: 'JWE è cifrato, il payload non è visibile!' });
      } else {
        const decodedToken = jwtDecode(token);
        setDecoded(decodedToken);
      }
    } catch (err) {
      setDecoded({ error: 'Errore nella decodifica' });
    }
  };

  return (
    <div style={styles.container}>
      <h4>{type} Token</h4>
      
      <div style={styles.tokenBox}>
        <small>{token?.substring(0, 50)}...</small>
      </div>
      
      <button onClick={handleDecode} style={styles.button}>
        Decodifica {type}
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
};

export default TokenInspector;
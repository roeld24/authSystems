const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class TokenUtils {
    /**
     * Genera JWT access token con durata basata sul ruolo
     * @param {object} payload - Payload del token (deve contenere isManager)
     */
    static generateJWT(payload) {
        // Determina la durata in base al ruolo
        const expiresIn = payload.isManager ? '5m' : '2m';
        
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn,
            algorithm: 'HS256'
        });
    }

    /**
     * Verifica JWT access token
     */
    static verifyJWT(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Token non valido o scaduto');
        }
    }

    /**
     * Genera refresh token (durata maggiore)
     */
    static generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // USA VARIABILE ENV
            algorithm: 'HS256'
        });
    }

    /**
     * Verifica refresh token
     */
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Refresh token non valido');
        }
    }

    /**
     * Salva refresh token nel database
     */
    static async saveRefreshToken(employeeId, token) {
        const expiresAt = new Date();
        
        // Calcola scadenza basandosi sulla variabile ENV
        const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        
        // Parsea il tempo (supporta formato come '7d', '10s', '2h', ecc.)
        const timeValue = parseInt(refreshExpiry);
        const timeUnit = refreshExpiry.replace(/[0-9]/g, '');
        
        switch(timeUnit) {
            case 's':
                expiresAt.setSeconds(expiresAt.getSeconds() + timeValue);
                break;
            case 'm':
                expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
                break;
            case 'h':
                expiresAt.setHours(expiresAt.getHours() + timeValue);
                break;
            case 'd':
                expiresAt.setDate(expiresAt.getDate() + timeValue);
                break;
            default:
                expiresAt.setDate(expiresAt.getSeconds() + 10); // Default 7 giorni
        }

        await pool.query(
            `INSERT INTO RefreshTokens (EmployeeId, Token, ExpiresAt) 
            VALUES (?, ?, ?)`,
            [employeeId, token, expiresAt]
        );
    }

    /**
     * Valida refresh token dal database
     */
  static async validateRefreshToken(employeeId, token) {
    const [rows] = await pool.query(
        `SELECT * FROM RefreshTokens 
        WHERE EmployeeId = ? 
        AND Token = ? 
        AND ExpiresAt > NOW()
        AND Revoked = FALSE`,
        [employeeId, token]
    );

    if (rows.length === 0) {
        // Controlla perché non è valido
        const [allTokens] = await pool.query(
            `SELECT ExpiresAt, Revoked FROM RefreshTokens 
            WHERE EmployeeId = ? 
            AND Token = ?`,
            [employeeId, token]
        );

        if (allTokens.length > 0) {
            const tokenInfo = allTokens[0];
            const now = new Date();
            const expiresAt = new Date(tokenInfo.ExpiresAt);
            
            if (expiresAt < now) {
                console.log(` REFRESH TOKEN SCADUTO NEL DATABASE`);
                console.log(`   - Scaduto il: ${expiresAt.toLocaleString('it-IT')}`);
                console.log(`   - Ora attuale: ${now.toLocaleString('it-IT')}`);
                console.log(`   - Tempo trascorso: ${Math.floor((now - expiresAt) / 1000)}s dalla scadenza`);
            }
            
            if (tokenInfo.Revoked) {
                console.log(` REFRESH TOKEN REVOCATO (logout manuale o cambio password)`);
            }
        }
    }

    return rows.length > 0;
}

    /**
     * Revoca refresh token
     */
    static async revokeRefreshToken(token) {
        await pool.query(
            `UPDATE RefreshTokens 
            SET Revoked = TRUE, RevokedAt = NOW() 
            WHERE Token = ?`,
            [token]
        );
    }

    /**
     * Revoca tutti i refresh token di un employee
     */
    static async revokeAllRefreshTokens(employeeId) {
        await pool.query(
            `UPDATE RefreshTokens 
            SET Revoked = TRUE, RevokedAt = NOW() 
            WHERE EmployeeId = ?`,
            [employeeId]
        );
    }

    /**
     * Cleanup token scaduti (manutenzione)
     */
    static async cleanupExpiredTokens() {
        const [result] = await pool.query(
            `DELETE FROM RefreshTokens 
            WHERE ExpiresAt < NOW() OR Revoked = TRUE`
        );

        return result.affectedRows;
    }

    /**
     * Validazione complessità password
     * Requisiti: 6-14 caratteri, almeno 3 delle 4 categorie
     */
    static validatePasswordComplexity(password) {
        const errors = [];

        // Lunghezza
        if (password.length < 6) {
            errors.push('La password deve essere lunga almeno 6 caratteri');
        }
        if (password.length > 14) {
            errors.push('La password non può superare 14 caratteri');
        }

        // Categorie
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecial = /[-!$#%]/.test(password);

        const categoriesCount = [
            hasUppercase, 
            hasLowercase, 
            hasNumbers, 
            hasSpecial
        ].filter(Boolean).length;

        if (categoriesCount < 3) {
            errors.push('La password deve contenere almeno 3 delle seguenti categorie: maiuscole, minuscole, numeri, caratteri speciali');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Decodifica token senza verificarlo (per debug)
     */
    static decodeToken(token) {
        return jwt.decode(token);
    }

    /**
     * Ottieni tempo rimanente di validità del token (in secondi)
     */
    static getTokenTimeRemaining(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) return 0;

            const now = Math.floor(Date.now() / 1000);
            const remaining = decoded.exp - now;

            return Math.max(0, remaining);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Verifica se il token sta per scadere (< 1 minuto)
     */
    static isTokenExpiring(token) {
        const remaining = this.getTokenTimeRemaining(token);
        return remaining > 0 && remaining < 60;
    }
}

// Cleanup automatico token ogni ora
setInterval(async () => {
    try {
        const deleted = await TokenUtils.cleanupExpiredTokens();
        if (deleted > 0) {
            console.log(`Cleaned up ${deleted} expired tokens`);
        }
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
    }
}, 60 * 60 * 1000);

module.exports = TokenUtils;
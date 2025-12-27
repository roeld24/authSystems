// src/utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class TokenUtils {
    /**
     * Genera JWT access token
     */
    static generateJWT(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '5m', // 5 minuti come da requisiti
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
            expiresIn: '7d', // 7 giorni
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
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 giorni

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
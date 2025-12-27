// src/models/auditLog.model.js
const { pool } = require('../config/database');

class AuditLog {
    // Azioni tracciabili
    static ACTIONS = {
        LOGIN: 'LOGIN',
        LOGIN_FAILED: 'LOGIN_FAILED',
        LOGOUT: 'LOGOUT',
        PASSWORD_CHANGE: 'PASSWORD_CHANGE',
        PASSWORD_CHANGE_FAILED: 'PASSWORD_CHANGE_FAILED',
        TOKEN_REFRESH: 'TOKEN_REFRESH',
        VIEW_CUSTOMERS: 'VIEW_CUSTOMERS',
        VIEW_CUSTOMER_DETAIL: 'VIEW_CUSTOMER_DETAIL',
        SEARCH_CUSTOMERS: 'SEARCH_CUSTOMERS',
        EXPORT_DATA: 'EXPORT_DATA',
        UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
        ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
        SESSION_TIMEOUT: 'SESSION_TIMEOUT'
    };

    /**
     * Log generico
     */
    static async log(employeeId, action, details = '', req = null) {
        try {
            const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
            const userAgent = req?.headers['user-agent'] || 'unknown';

            await pool.query(
                `INSERT INTO AuditLog 
                (EmployeeId, Action, Details, IpAddress, UserAgent) 
                VALUES (?, ?, ?, ?, ?)`,
                [employeeId, action, details, ipAddress, userAgent]
            );

            return true;
        } catch (error) {
            console.error('Error logging audit:', error);
            return false;
        }
    }

    /**
     * Log login
     */
    static async logLogin(employeeId, success, req, details = '') {
        const action = success ? this.ACTIONS.LOGIN : this.ACTIONS.LOGIN_FAILED;
        return this.log(employeeId, action, details, req);
    }

    /**
     * Log logout
     */
    static async logLogout(employeeId, req, reason = 'manual') {
        return this.log(
            employeeId, 
            this.ACTIONS.LOGOUT, 
            `Logout reason: ${reason}`, 
            req
        );
    }

    /**
     * Log cambio password
     */
    static async logPasswordChange(employeeId, req) {
        return this.log(
            employeeId, 
            this.ACTIONS.PASSWORD_CHANGE, 
            'Password changed successfully', 
            req
        );
    }

    /**
     * Log token refresh
     */
    static async logTokenRefresh(employeeId, req) {
        return this.log(
            employeeId, 
            this.ACTIONS.TOKEN_REFRESH, 
            'Access token refreshed', 
            req
        );
    }

    /**
     * Ottieni tutti i log con filtri
     */
    static async getAll(filters = {}) {
        const {
            employeeId,
            action,
            dateFrom,
            dateTo,
            search,
            limit = 100,
            offset = 0
        } = filters;

        let query = `
            SELECT 
                al.LogId as id,
                al.EmployeeId,
                CONCAT(e.FirstName, ' ', e.LastName) as employeeName,
                e.Email as employeeEmail,
                al.Action,
                al.Details,
                al.IpAddress,
                al.UserAgent,
                al.CreatedAt
            FROM AuditLog al
            LEFT JOIN Employee e ON al.EmployeeId = e.EmployeeId
            WHERE 1=1
        `;

        const params = [];

        if (employeeId) {
            query += ` AND al.EmployeeId = ?`;
            params.push(employeeId);
        }

        if (action) {
            query += ` AND al.Action = ?`;
            params.push(action);
        }

        if (dateFrom) {
            query += ` AND al.CreatedAt >= ?`;
            params.push(dateFrom);
        }

        if (dateTo) {
            query += ` AND al.CreatedAt <= ?`;
            params.push(dateTo);
        }

        if (search) {
            query += ` AND (
                al.Details LIKE ? OR 
                al.IpAddress LIKE ? OR
                e.FirstName LIKE ? OR
                e.LastName LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY al.CreatedAt DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    /**
     * Conta log con filtri
     */
    static async count(employeeId = null, filters = {}) {
        let query = `SELECT COUNT(*) as total FROM AuditLog WHERE 1=1`;
        const params = [];

        if (employeeId) {
            query += ` AND EmployeeId = ?`;
            params.push(employeeId);
        }

        if (filters.action) {
            query += ` AND Action = ?`;
            params.push(filters.action);
        }

        if (filters.dateFrom) {
            query += ` AND CreatedAt >= ?`;
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            query += ` AND CreatedAt <= ?`;
            params.push(filters.dateTo);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].total;
    }

    /**
     * Ottieni lista azioni disponibili
     */
    static async getActions() {
        const [rows] = await pool.query(
            `SELECT DISTINCT Action FROM AuditLog ORDER BY Action`
        );
        return rows.map(r => r.Action);
    }

    /**
     * Ottieni log di sicurezza (login falliti, accessi non autorizzati, ecc.)
     */
    static async getSecurityEvents(days = 7) {
        const [rows] = await pool.query(
            `SELECT 
                al.LogId as id,
                al.EmployeeId,
                CONCAT(e.FirstName, ' ', e.LastName) as employeeName,
                al.Action,
                al.Details,
                al.IpAddress,
                al.CreatedAt
            FROM AuditLog al
            LEFT JOIN Employee e ON al.EmployeeId = e.EmployeeId
            WHERE al.Action IN (?, ?, ?, ?)
            AND al.CreatedAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY al.CreatedAt DESC`,
            [
                this.ACTIONS.LOGIN_FAILED,
                this.ACTIONS.UNAUTHORIZED_ACCESS,
                this.ACTIONS.ACCOUNT_LOCKED,
                this.ACTIONS.PASSWORD_CHANGE_FAILED,
                days
            ]
        );
        return rows;
    }

    /**
     * Ottieni statistiche log per employee
     */
    static async getEmployeeStats(employeeId, days = 30) {
        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as totalActions,
                COUNT(CASE WHEN Action = ? THEN 1 END) as logins,
                COUNT(CASE WHEN Action = ? THEN 1 END) as failedLogins,
                MAX(CreatedAt) as lastActivity
            FROM AuditLog
            WHERE EmployeeId = ?
            AND CreatedAt >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [
                this.ACTIONS.LOGIN,
                this.ACTIONS.LOGIN_FAILED,
                employeeId,
                days
            ]
        );

        return stats[0] || {
            totalActions: 0,
            logins: 0,
            failedLogins: 0,
            lastActivity: null
        };
    }

    /**
     * Pulisci log vecchi (manutenzione)
     */
    static async cleanOldLogs(days = 90) {
        const [result] = await pool.query(
            `DELETE FROM AuditLog 
            WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );

        return result.affectedRows;
    }
}

module.exports = AuditLog;
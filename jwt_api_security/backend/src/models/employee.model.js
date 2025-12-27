// src/models/employee.model.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Employee {
    /**
     * Trova employee per email
     */
    static async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT 
                EmployeeId as id,
                FirstName,
                LastName,
                Title,
                Email,
                password,
                CASE WHEN Title LIKE '%Manager%' THEN TRUE ELSE FALSE END as isManager,
                lastPasswordChange,
                lastActivity,
                failedLoginAttempts,
                accountLocked
            FROM Employee 
            WHERE Email = ?`,
            [email]
        );
        return rows[0];
    }

    /**
     * Trova employee per ID
     */
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT 
                EmployeeId as id,
                FirstName,
                LastName,
                Title,
                Email,
                Phone,
                Fax,
                CASE WHEN Title LIKE '%Manager%' THEN TRUE ELSE FALSE END as isManager,
                lastActivity,
                HireDate,
                ReportsTo
            FROM Employee 
            WHERE EmployeeId = ?`,
            [id]
        );
        return rows[0];
    }

    /**
     * Aggiorna password
     */
    static async updatePassword(employeeId, newPasswordHash) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Ottieni la vecchia password per lo storico
            const [current] = await connection.query(
                'SELECT password FROM Employee WHERE EmployeeId = ?',
                [employeeId]
            );

            if (current[0]) {
                // Salva nello storico
                await connection.query(
                    'INSERT INTO PasswordHistory (EmployeeId, PasswordHash) VALUES (?, ?)',
                    [employeeId, current[0].password]
                );
            }

            // Aggiorna la nuova password
            await connection.query(
                `UPDATE Employee 
                SET password = ?, 
                    lastPasswordChange = NOW(),
                    failedLoginAttempts = 0,
                    accountLocked = FALSE
                WHERE EmployeeId = ?`,
                [newPasswordHash, employeeId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Verifica se la password è stata già usata
     */
    static async isPasswordReused(employeeId, password) {
        // Ottieni password corrente
        const [current] = await pool.query(
            'SELECT password FROM Employee WHERE EmployeeId = ?',
            [employeeId]
        );

        if (current[0] && await bcrypt.compare(password, current[0].password)) {
            return true;
        }

        // Controlla storico (ultima password)
        const [history] = await pool.query(
            `SELECT PasswordHash 
            FROM PasswordHistory 
            WHERE EmployeeId = ? 
            ORDER BY ChangedAt DESC 
            LIMIT 1`,
            [employeeId]
        );

        if (history[0] && await bcrypt.compare(password, history[0].PasswordHash)) {
            return true;
        }

        return false;
    }

    /**
     * Incrementa tentativi di login falliti
     */
    static async incrementFailedAttempts(email) {
        await pool.query(
            `UPDATE Employee 
            SET failedLoginAttempts = failedLoginAttempts + 1,
                accountLocked = CASE 
                    WHEN failedLoginAttempts >= 4 THEN TRUE 
                    ELSE FALSE 
                END
            WHERE Email = ?`,
            [email]
        );
    }

    /**
     * Reset tentativi di login
     */
    static async resetFailedAttempts(employeeId) {
        await pool.query(
            'UPDATE Employee SET failedLoginAttempts = 0, accountLocked = FALSE WHERE EmployeeId = ?',
            [employeeId]
        );
    }

    /**
     * Aggiorna ultima attività
     */
    static async updateLastActivity(employeeId) {
        await pool.query(
            'UPDATE Employee SET lastActivity = NOW() WHERE EmployeeId = ?',
            [employeeId]
        );
    }

    /**
     * Ottieni tutti gli employee (solo per admin/stats)
     */
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT 
                EmployeeId as id,
                FirstName,
                LastName,
                Title,
                Email,
                CASE WHEN Title LIKE '%Manager%' THEN TRUE ELSE FALSE END as isManager,
                HireDate
            FROM Employee
            ORDER BY LastName, FirstName`
        );
        return rows;
    }

    /**
     * Verifica se l'utente è manager (basato su Title)
     */
    static async isManager(employeeId) {
        const [rows] = await pool.query(
            'SELECT Title FROM Employee WHERE EmployeeId = ?',
            [employeeId]
        );
        return rows[0]?.Title?.toLowerCase().includes('manager') || false;
    }

    /**
     * Ottieni statistiche employee
     */
    static async getStats(employeeId) {
        const [stats] = await pool.query(
            `SELECT 
                COUNT(DISTINCT c.CustomerId) as totalCustomers,
                COUNT(DISTINCT i.InvoiceId) as totalInvoices,
                COALESCE(SUM(i.Total), 0) as totalRevenue
            FROM Employee e
            LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
            LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
            WHERE e.EmployeeId = ?
            GROUP BY e.EmployeeId`,
            [employeeId]
        );
        
        return stats[0] || { totalCustomers: 0, totalInvoices: 0, totalRevenue: 0 };
    }

    /**
     * Inizializza password di default per tutti gli employee
     * (da usare solo in setup iniziale)
     */
    static async initializeDefaultPasswords() {
        const defaultPassword = 'Jo5hu4!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await pool.query(
            'UPDATE Employee SET password = ? WHERE password IS NULL OR password = ""',
            [hashedPassword]
        );

        return true;
    }
}

module.exports = Employee;
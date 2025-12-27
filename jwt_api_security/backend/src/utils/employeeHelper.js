// src/utils/employeeHelper.js

/**
 * Helper functions per Employee
 */
class EmployeeHelper {
    /**
     * Verifica se un employee è manager basandosi sul Title
     * @param {string} title - Il titolo dell'employee
     * @returns {boolean}
     */
    static isManager(title) {
        if (!title) return false;
        return title.toLowerCase().includes('manager');
    }

    /**
     * Determina isManager da un oggetto employee
     * @param {object} employee - Oggetto employee con campo Title
     * @returns {boolean}
     */
    static checkManagerStatus(employee) {
        return this.isManager(employee?.Title);
    }

    /**
     * Formatta nome completo employee
     * @param {object} employee - Oggetto employee
     * @returns {string}
     */
    static getFullName(employee) {
        if (!employee) return '';
        return `${employee.FirstName} ${employee.LastName}`.trim();
    }

    /**
     * Ottieni ruolo display (per UI)
     * @param {object} employee - Oggetto employee
     * @returns {string}
     */
    static getRoleDisplay(employee) {
        if (!employee) return 'Employee';
        return this.isManager(employee.Title) ? 'Manager' : 'Employee';
    }

    /**
     * Valida email employee
     * @param {string} email
     * @returns {boolean}
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitizza input (previene XSS base)
     * @param {string} input
     * @returns {string}
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Verifica permessi per vedere un cliente
     * @param {object} employee - Employee corrente
     * @param {number} customerSupportRepId - SupportRepId del cliente
     * @returns {boolean}
     */
    static canViewCustomer(employee, customerSupportRepId) {
        if (!employee) return false;
        
        // Manager possono vedere tutti i clienti
        if (this.isManager(employee.Title)) return true;
        
        // Employee normali solo i propri clienti
        return employee.EmployeeId === customerSupportRepId || 
               employee.id === customerSupportRepId;
    }

    /**
     * Verifica permessi per azione manager-only
     * @param {object} employee - Employee corrente
     * @returns {boolean}
     */
    static canPerformManagerAction(employee) {
        if (!employee) return false;
        return this.isManager(employee.Title);
    }

    /**
     * Ottieni badge CSS class basato su ruolo
     * @param {object} employee
     * @returns {string}
     */
    static getRoleBadgeClass(employee) {
        return this.isManager(employee?.Title) ? 'badge-manager' : 'badge-employee';
    }

    /**
     * Formatta data hire
     * @param {string|Date} hireDate
     * @returns {string}
     */
    static formatHireDate(hireDate) {
        if (!hireDate) return 'N/A';
        
        const date = new Date(hireDate);
        const now = new Date();
        const years = now.getFullYear() - date.getFullYear();
        
        return `${date.toLocaleDateString('it-IT')} (${years} anni)`;
    }

    /**
     * Calcola seniority in anni
     * @param {string|Date} hireDate
     * @returns {number}
     */
    static calculateSeniority(hireDate) {
        if (!hireDate) return 0;
        
        const hire = new Date(hireDate);
        const now = new Date();
        
        return Math.floor((now - hire) / (1000 * 60 * 60 * 24 * 365));
    }

    /**
     * Ottieni lista di tutti i possibili Title con flag manager
     * (utile per UI/filtri)
     * @param {Array} employees - Array di employee
     * @returns {Array}
     */
    static getTitlesList(employees) {
        const titlesSet = new Set();
        
        employees.forEach(emp => {
            if (emp.Title) titlesSet.add(emp.Title);
        });
        
        return Array.from(titlesSet).map(title => ({
            title,
            isManager: this.isManager(title)
        })).sort((a, b) => {
            // Manager prima
            if (a.isManager && !b.isManager) return -1;
            if (!a.isManager && b.isManager) return 1;
            return a.title.localeCompare(b.title);
        });
    }

    /**
     * Filtra employees per ruolo
     * @param {Array} employees
     * @param {string} role - 'manager' | 'employee' | 'all'
     * @returns {Array}
     */
    static filterByRole(employees, role) {
        if (role === 'all') return employees;
        
        const shouldBeManager = role === 'manager';
        
        return employees.filter(emp => 
            this.isManager(emp.Title) === shouldBeManager
        );
    }

    /**
     * Cerca employees per nome, email o title
     * @param {Array} employees
     * @param {string} query
     * @returns {Array}
     */
    static searchEmployees(employees, query) {
        if (!query || query.trim().length === 0) return employees;
        
        const searchTerm = query.toLowerCase().trim();
        
        return employees.filter(emp => 
            emp.FirstName?.toLowerCase().includes(searchTerm) ||
            emp.LastName?.toLowerCase().includes(searchTerm) ||
            emp.Email?.toLowerCase().includes(searchTerm) ||
            emp.Title?.toLowerCase().includes(searchTerm) ||
            this.getFullName(emp).toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Ottieni statistiche riepilogo employees
     * @param {Array} employees
     * @returns {object}
     */
    static getEmployeeStats(employees) {
        const managers = employees.filter(emp => this.isManager(emp.Title));
        const regularEmployees = employees.filter(emp => !this.isManager(emp.Title));
        
        return {
            total: employees.length,
            managers: managers.length,
            employees: regularEmployees.length,
            percentageManagers: employees.length > 0 
                ? Math.round((managers.length / employees.length) * 100) 
                : 0
        };
    }
}

module.exports = EmployeeHelper;
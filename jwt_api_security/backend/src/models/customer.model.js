// src/models/customer.model.js
const { pool } = require('../config/database');

class Customer {
    /**
     * Ottieni customers con filtri e paginazione
     */
    static async getAll(filters = {}) {
        const {
            employeeId,
            country,
            city,
            search,
            limit = 50,
            offset = 0,
            sortBy = 'LastName',
            sortOrder = 'ASC'
        } = filters;

        let query = `
            SELECT 
                c.CustomerId as id,
                c.FirstName,
                c.LastName,
                c.Company,
                c.Address,
                c.City,
                c.State,
                c.Country,
                c.PostalCode,
                c.Phone,
                c.Fax,
                c.Email,
                c.SupportRepId,
                CONCAT(e.FirstName, ' ', e.LastName) as SupportRepName,
                COUNT(DISTINCT i.InvoiceId) as totalInvoices,
                COALESCE(SUM(i.Total), 0) as totalSpent
            FROM Customer c
            LEFT JOIN Employee e ON c.SupportRepId = e.EmployeeId
            LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
            WHERE 1=1
        `;

        const params = [];

        // Filtro per employeeId (se non è manager)
        if (employeeId) {
            query += ` AND c.SupportRepId = ?`;
            params.push(employeeId);
        }

        // Filtro per paese
        if (country) {
            query += ` AND c.Country = ?`;
            params.push(country);
        }

        // Filtro per città
        if (city) {
            query += ` AND c.City = ?`;
            params.push(city);
        }

        // Ricerca testuale
        if (search) {
            query += ` AND (
                c.FirstName LIKE ? OR 
                c.LastName LIKE ? OR 
                c.Email LIKE ? OR 
                c.Company LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ` GROUP BY c.CustomerId`;

        // Ordinamento (protezione SQL injection)
        const allowedSortFields = ['FirstName', 'LastName', 'Company', 'Country', 'City', 'totalSpent'];
        const allowedOrders = ['ASC', 'DESC'];
        
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'LastName';
        const safeSortOrder = allowedOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
        
        query += ` ORDER BY ? ?`;
        params.push(safeSortBy, safeSortOrder);

        // Paginazione
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }

    /**
     * Conta customers con filtri
     */
    static async count(filters = {}) {
        const {
            employeeId,
            country,
            city,
            search
        } = filters;

        let query = `
            SELECT COUNT(DISTINCT c.CustomerId) as total
            FROM Customer c
            WHERE 1=1
        `;

        const params = [];

        if (employeeId) {
            query += ` AND c.SupportRepId = ?`;
            params.push(employeeId);
        }

        if (country) {
            query += ` AND c.Country = ?`;
            params.push(country);
        }

        if (city) {
            query += ` AND c.City = ?`;
            params.push(city);
        }

        if (search) {
            query += ` AND (
                c.FirstName LIKE ? OR 
                c.LastName LIKE ? OR 
                c.Email LIKE ? OR 
                c.Company LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].total;
    }

    /**
     * Ottieni customer per ID
     */
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT 
                c.*,
                CONCAT(e.FirstName, ' ', e.LastName) as SupportRepName,
                e.Email as SupportRepEmail,
                COUNT(DISTINCT i.InvoiceId) as totalInvoices,
                COALESCE(SUM(i.Total), 0) as totalSpent,
                MAX(i.InvoiceDate) as lastPurchaseDate
            FROM Customer c
            LEFT JOIN Employee e ON c.SupportRepId = e.EmployeeId
            LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
            WHERE c.CustomerId = ?
            GROUP BY c.CustomerId`,
            [id]
        );
        return rows[0];
    }

    /**
     * Ottieni fatture di un customer
     */
    static async getInvoices(customerId, limit = 10) {
        const [rows] = await pool.query(
            `SELECT 
                InvoiceId as id,
                InvoiceDate,
                BillingAddress,
                BillingCity,
                BillingCountry,
                Total
            FROM Invoice
            WHERE CustomerId = ?
            ORDER BY InvoiceDate DESC
            LIMIT ?`,
            [customerId, parseInt(limit)]
        );
        return rows;
    }

    /**
     * Ottieni opzioni per filtri (paesi, città)
     */
    static async getFilterOptions(employeeId = null) {
        let countryQuery = `
            SELECT DISTINCT Country 
            FROM Customer 
            WHERE Country IS NOT NULL
        `;
        
        let cityQuery = `
            SELECT DISTINCT City, Country 
            FROM Customer 
            WHERE City IS NOT NULL
        `;

        const params = [];

        if (employeeId) {
            countryQuery += ` AND SupportRepId = ?`;
            cityQuery += ` AND SupportRepId = ?`;
            params.push(employeeId);
        }

        countryQuery += ` ORDER BY Country`;
        cityQuery += ` ORDER BY Country, City`;

        const [countries] = await pool.query(countryQuery, employeeId ? [employeeId] : []);
        const [cities] = await pool.query(cityQuery, employeeId ? [employeeId] : []);

        return {
            countries: countries.map(r => r.Country),
            cities: cities.map(r => ({ city: r.City, country: r.Country }))
        };
    }

    /**
     * Ottieni statistiche generali
     */
    static async getStatistics(employeeId = null) {
        let query = `
            SELECT 
                COUNT(DISTINCT c.CustomerId) as totalCustomers,
                COUNT(DISTINCT c.Country) as totalCountries,
                COUNT(DISTINCT i.InvoiceId) as totalInvoices,
                CAST(COALESCE(SUM(i.Total), 0) AS FLOAT) as totalRevenue, -- Cast to Number
                CAST(COALESCE(AVG(i.Total), 0) AS FLOAT) as avgInvoiceValue
            FROM Customer c
            LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
        `;

        const params1 = [];
        if (employeeId) {
            query += ` WHERE c.SupportRepId = ?`;
            params1.push(employeeId);
        }

        const [stats] = await pool.query(query, params1);

        let topCustomersQuery = `
            SELECT 
                c.CustomerId as id,
                CONCAT(c.FirstName, ' ', c.LastName) as name,
                c.Email,
                COUNT(i.InvoiceId) as invoiceCount,
                CAST(COALESCE(SUM(i.Total), 0) AS FLOAT) as totalSpent
            FROM Customer c
            LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
        `;

        const params2 = [];
        if (employeeId) {
            topCustomersQuery += ` WHERE c.SupportRepId = ?`;
            params2.push(employeeId);
        }

        topCustomersQuery += `
            GROUP BY c.CustomerId, c.FirstName, c.LastName, c.Email -- Full Group By
            ORDER BY totalSpent DESC
            LIMIT 5
        `;

        const [topCustomers] = await pool.query(topCustomersQuery, params2);

        return {
            ...stats[0],
            topCustomers
        };
    }

    /**
     * Verifica se un customer appartiene a un employee
     */
    static async belongsToEmployee(customerId, employeeId) {
        const [rows] = await pool.query(
            'SELECT CustomerId FROM Customer WHERE CustomerId = ? AND SupportRepId = ?',
            [customerId, employeeId]
        );
        return rows.length > 0;
    }
}

module.exports = Customer;

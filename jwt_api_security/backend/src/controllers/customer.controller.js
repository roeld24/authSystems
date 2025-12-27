// src/controllers/customer.controller.js
const Customer = require('../models/customer.model');
const AuditLog = require('../models/auditLog.model');

class CustomerController {
    /**
     * Ottieni lista customers
     */
    static async getCustomers(req, res) {
        try {
            const user = req.user;
            
            // Manager vedono tutti, employee solo i propri
            const employeeId = user.isManager ? null : user.userId;

            const filters = {
                employeeId,
                country: req.query.country,
                city: req.query.city,
                search: req.query.search,
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
                sortBy: req.query.sortBy || 'LastName',
                sortOrder: req.query.sortOrder || 'ASC'
            };

            const customers = await Customer.getAll(filters);
            const total = await Customer.count(filters);

            // Log accesso
            await AuditLog.log(
                user.userId, 
                AuditLog.ACTIONS.VIEW_CUSTOMERS,
                `Viewed customers list (${customers.length} results)`,
                req
            );

            res.json({
                customers,
                pagination: {
                    total,
                    limit: filters.limit,
                    offset: filters.offset,
                    hasMore: (filters.offset + filters.limit) < total
                }
            });

        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ error: 'Errore recupero clienti' });
        }
    }

    /**
     * Cerca customers
     */
    static async searchCustomers(req, res) {
        try {
            const user = req.user;
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({ 
                    error: 'Query di ricerca troppo breve (minimo 2 caratteri)' 
                });
            }

            const employeeId = user.isManager ? null : user.userId;

            const customers = await Customer.getAll({
                employeeId,
                search: q,
                limit: 20
            });

            await AuditLog.log(
                user.userId,
                AuditLog.ACTIONS.SEARCH_CUSTOMERS,
                `Searched: "${q}" - ${customers.length} results`,
                req
            );

            res.json({ customers });

        } catch (error) {
            console.error('Error searching customers:', error);
            res.status(500).json({ error: 'Errore ricerca clienti' });
        }
    }

    /**
     * Ottieni dettaglio customer
     */
    static async getCustomerById(req, res) {
        try {
            const user = req.user;
            const customerId = parseInt(req.params.id);

            if (isNaN(customerId)) {
                return res.status(400).json({ error: 'ID cliente non valido' });
            }

            const customer = await Customer.findById(customerId);

            if (!customer) {
                return res.status(404).json({ error: 'Cliente non trovato' });
            }

            // Verifica autorizzazione
            if (!user.isManager && customer.SupportRepId !== user.userId) {
                await AuditLog.log(
                    user.userId,
                    AuditLog.ACTIONS.UNAUTHORIZED_ACCESS,
                    `Attempted to access customer ${customerId}`,
                    req
                );

                return res.status(403).json({ 
                    error: 'Non hai i permessi per visualizzare questo cliente' 
                });
            }

            // Ottieni fatture
            const invoices = await Customer.getInvoices(customerId, 10);

            await AuditLog.log(
                user.userId,
                AuditLog.ACTIONS.VIEW_CUSTOMER_DETAIL,
                `Viewed customer ${customerId} details`,
                req
            );

            res.json({
                customer,
                invoices
            });

        } catch (error) {
            console.error('Error fetching customer:', error);
            res.status(500).json({ error: 'Errore recupero dettagli cliente' });
        }
    }

    /**
     * Ottieni opzioni filtri
     */
    static async getFilterOptions(req, res) {
        try {
            const user = req.user;
            const employeeId = user.isManager ? null : user.userId;

            const options = await Customer.getFilterOptions(employeeId);

            res.json(options);

        } catch (error) {
            console.error('Error fetching filter options:', error);
            res.status(500).json({ error: 'Errore recupero opzioni filtri' });
        }
    }

    /**
     * Ottieni statistiche
     */
    static async getStatistics(req, res) {
        try {
            const user = req.user;
            const employeeId = user.isManager ? null : user.userId;

            const stats = await Customer.getStatistics(employeeId);

            res.json(stats);

        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).json({ error: 'Errore recupero statistiche' });
        }
    }

    /**
     * Export customers (solo manager)
     */
    static async exportCustomers(req, res) {
        try {
            const user = req.user;

            if (!user.isManager) {
                return res.status(403).json({ 
                    error: 'Solo i manager possono esportare i dati' 
                });
            }

            const customers = await Customer.getAll({
                limit: 10000 // Export massivo
            });

            await AuditLog.log(
                user.userId,
                AuditLog.ACTIONS.EXPORT_DATA,
                `Exported ${customers.length} customers`,
                req
            );

            // Converte in CSV
            const csv = convertToCSV(customers);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
            res.send(csv);

        } catch (error) {
            console.error('Error exporting customers:', error);
            res.status(500).json({ error: 'Errore export clienti' });
        }
    }
}

/**
 * Helper per convertire in CSV
 */
function convertToCSV(customers) {
    if (customers.length === 0) return '';

    const headers = Object.keys(customers[0]).join(',');
    const rows = customers.map(customer => 
        Object.values(customer)
            .map(val => `"${val || ''}"`)
            .join(',')
    );

    return [headers, ...rows].join('\n');
}

module.exports = CustomerController;
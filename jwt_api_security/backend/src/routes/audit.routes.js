const express = require('express');
const router = express.Router();
const AuditLog = require('../models/auditLog.model');
const { 
    authenticate, 
    requireManager 
} = require('../middleware/auth.middleware');

var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
    windowMs: 15*60*1000, // 15 minuti
    max: 100 // limita ogni IP a 100 richieste per windowMs
});

router.use(limiter);

router.use(authenticate);
router.use(requireManager);

/**
 * GET /api/audit-logs
 * Ottieni tutti i log con filtri
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            employeeId: req.query.employeeId,
            action: req.query.action,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            search: req.query.search,
            limit: parseInt(req.query.limit) || 100,
            offset: parseInt(req.query.offset) || 0
        };

        console.log('Fetching audit logs with filters:', filters);

        const logs = await AuditLog.getAll(filters);
        const total = await AuditLog.count(filters);

        console.log(`Found ${logs.length} logs, total: ${total}`);

        res.json({ 
            logs, 
            total,
            filters
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ 
            error: 'Errore recupero log',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/audit-logs/actions
 * Ottieni lista azioni disponibili
 */
router.get('/actions', async (req, res) => {
    try {
        const actions = await AuditLog.getActions();
        console.log('Available actions:', actions);
        
        res.json({ actions });
    } catch (error) {
        console.error('Error fetching actions:', error);
        res.status(500).json({ 
            error: 'Errore recupero azioni',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/audit-logs/security-events
 * Ottieni eventi di sicurezza recenti
 */
router.get('/security-events', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const events = await AuditLog.getSecurityEvents(days);
        
        res.json({ 
            events,
            days
        });
    } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ 
            error: 'Errore recupero eventi sicurezza',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/audit-logs/employee/:employeeId/stats
 * Ottieni statistiche per un employee specifico
 */
router.get('/employee/:employeeId/stats', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const days = parseInt(req.query.days) || 30;
        
        const stats = await AuditLog.getEmployeeStats(employeeId, days);
        
        res.json({ 
            employeeId,
            stats,
            days
        });
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        res.status(500).json({ 
            error: 'Errore recupero statistiche employee',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;

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

// Solo manager
router.use(authenticate);
router.use(requireManager);

router.get('/', async (req, res) => {
    try {
        const filters = {
            employeeId: req.query.employeeId,
            action: req.query.action,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            search: req.query.search,
            limit: req.query.limit || 100,
            offset: req.query.offset || 0
        };

        const logs = await AuditLog.getAll(filters);
        const total = await AuditLog.count(null, filters);

        res.json({ logs, total });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Errore recupero log' });
    }
});

router.get('/actions', async (req, res) => {
    try {
        const actions = await AuditLog.getActions();
        res.json({ actions });
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero azioni' });
    }
});

router.get('/security-events', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const events = await AuditLog.getSecurityEvents(days);
        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero eventi sicurezza' });
    }
});

module.exports = router;

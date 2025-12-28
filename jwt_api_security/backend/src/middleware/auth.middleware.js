// src/middleware/auth.middleware.js
const TokenUtils = require('../utils/tokenUtils');
const Employee = require('../models/employee.model');
const AuditLog = require('../models/auditLog.model');

/**
 * Autenticazione JWT
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Token mancante' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        
        if (!token) {
            return res.status(401).json({ error: 'Token mancante' });
        }

        // Verifica JWT
        const decoded = TokenUtils.verifyJWT(token);
        req.user = decoded;

        // Aggiorna lastActivity
        if (decoded.userId) {
            await Employee.updateLastActivity(decoded.userId);
        }

        next();
    } catch (error) {
        console.error('Errore autenticazione:', error);
        res.status(401).json({ error: 'Token non valido o scaduto' });
    }
}

/**
 * RIMOSSO - Non più necessario il check di inattività
 * Il token JWT gestisce già la scadenza
 */

/**
 * Richiede ruolo manager
 */
async function requireManager(req, res, next) {
    try {
        if (!req.user?.isManager) {
            await AuditLog.log(
                req.user?.userId,
                AuditLog.ACTIONS.UNAUTHORIZED_ACCESS,
                'Attempted manager-only action',
                req
            );

            return res.status(403).json({ 
                error: 'Accesso negato: solo i manager possono eseguire questa azione' 
            });
        }

        next();
    } catch (error) {
        console.error('Errore check manager:', error);
        res.status(500).json({ error: 'Errore verifica permessi' });
    }
}

/**
 * Validazione input base
 */
function validateInput(req, res, next) {
    try {
        // Sanitizza parametri query
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    // Rimuove caratteri pericolosi per SQL injection
                    req.query[key] = req.query[key]
                        .replace(/['"`;]/g, '')
                        .trim();
                }
            });
        }

        // Sanitizza parametri body (non per password!)
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (key !== 'password' && 
                    key !== 'currentPassword' && 
                    key !== 'newPassword' && 
                    typeof req.body[key] === 'string') {
                    
                    req.body[key] = req.body[key]
                        .replace(/[<>]/g, '') // Previene XSS base
                        .trim();
                }
            });
        }

        next();
    } catch (error) {
        console.error('Errore validazione input:', error);
        res.status(400).json({ error: 'Input non valido' });
    }
}

/**
 * Rate limiting semplice (in-memory)
 */
const requestCounts = new Map();

function rateLimit(options = {}) {
    const {
        maxRequests = 5,
        windowMs = 15 * 60 * 1000 // 15 minuti
    } = options;

    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requestCounts.has(identifier)) {
            requestCounts.set(identifier, []);
        }

        const requests = requestCounts.get(identifier);
        
        // Rimuovi richieste vecchie
        const validRequests = requests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({ 
                error: 'Troppi tentativi. Riprova più tardi.',
                retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
            });
        }

        validRequests.push(now);
        requestCounts.set(identifier, validRequests);

        next();
    };
}

/**
 * Middleware per logging automatico
 */
function autoLog(action, getDetails = () => '') {
    return async (req, res, next) => {
        try {
            if (req.user?.userId) {
                const details = typeof getDetails === 'function' ? getDetails(req) : getDetails;
                await AuditLog.log(req.user.userId, action, details, req);
            }
            next();
        } catch (error) {
            console.error('Errore auto-logging:', error);
            next(); // Non bloccare per errori di logging
        }
    };
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Errori specifici
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Dati non validi',
            details: err.message 
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            error: 'Non autorizzato' 
        });
    }

    // Errore generico
    res.status(500).json({ 
        error: 'Si è verificato un errore. Riprova più tardi.' 
    });
}

/**
 * Cleanup periodico rate limiting (ogni ora)
 */
setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    
    for (const [key, requests] of requestCounts.entries()) {
        const validRequests = requests.filter(time => now - time < windowMs);
        
        if (validRequests.length === 0) {
            requestCounts.delete(key);
        } else {
            requestCounts.set(key, validRequests);
        }
    }
}, 60 * 60 * 1000);

module.exports = {
    authenticate,
    requireManager,
    validateInput,
    rateLimit,
    autoLog,
    errorHandler
};
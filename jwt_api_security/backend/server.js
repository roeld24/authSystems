require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const customerRoutes = require('./src/routes/customer.routes');
const auditRoutes = require('./src/routes/audit.routes'); // auditlog

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
testConnection();

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'API JWT funzionante!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            refresh: 'POST /api/auth/refresh',
            profile: 'GET /api/auth/profile',
            changePassword: 'POST /api/auth/change-password',
            customers: 'GET /api/customers',
            auditLogs: 'GET /api/audit-logs'
        }
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Customer routes (protette da JWT e middleware di gestione)
app.use('/api/customers', customerRoutes);

// Audit log routes (solo manager)
app.use('/api/audit-logs', auditRoutes);

// Error handler (semplice)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Errore interno del server' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

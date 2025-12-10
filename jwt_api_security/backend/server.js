require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API JWT/JWS/JWE/JWK funzionante!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      refresh: 'POST /api/auth/refresh',
      jwk: 'GET /api/auth/jwk'
    }
  });
});

app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});
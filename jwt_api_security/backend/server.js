require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const protectedRoutes = require('./src/routes/protected.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

testConnection();

app.get('/', (req, res) => {

    res.json({
        message: 'API JWT/JWS/JWE/JWK funzionante!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            refresh: 'POST /api/auth/refresh',
            jwk: 'GET /api/auth/jwk',
            jwtProtected: 'GET /api/protected/jwt-protected',
            jwsProtected: 'GET /api/protected/jws-protected',
            jweProtected: 'GET /api/protected/jwe-protected'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port:${PORT}...`);
});

console.log('JWT_REFRESH_EXPIRES_IN:', process.env.JWT_REFRESH_EXPIRES_IN);


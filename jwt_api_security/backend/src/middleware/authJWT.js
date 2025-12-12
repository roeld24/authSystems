const TokenUtils = require('../utils/tokenUtils');

async function authJWT(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Missing token' });

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) return res.status(401).json({ error: 'Missing token' });

        const decoded = TokenUtils.verifyJWT(token); // decodifica e verifica HS256
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT auth error:', error);
        res.status(401).json({ error: 'Invalid or broken token' });
    }
}

module.exports = authJWT;

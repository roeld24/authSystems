const TokenUtils = require('../utils/tokenUtils');

async function authJWE(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Missing token' });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });

        console.log('AuthHeader:', authHeader);
        console.log('Extracted token:', token);

        const payload = await TokenUtils.verifyJWE(token);
        req.user = payload;

        next();
    } catch (error) {
        console.error('JWE auth error:', error);
        res.status(401).json({ error: 'Invalid or broken token' });
    }
}

module.exports = authJWE;

// src/middleware/authJWS.js
const TokenUtils = require('../utils/tokenUtils');

async function authJWS(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    const decoded = await TokenUtils.verifyJWS(token); // decodifica e verifica RS256
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWS auth error:', error);
    res.status(401).json({ error: 'Token non valido' });
  }
}

module.exports = authJWS;

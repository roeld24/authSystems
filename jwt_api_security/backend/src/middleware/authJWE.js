// src/middleware/authJWE.js
const TokenUtils = require('../utils/tokenUtils');

async function authJWE(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    const payload = await TokenUtils.decryptJWE(token); // decifra JWE
    req.user = payload;
    next();
  } catch (error) {
    console.error('JWE auth error:', error);
    res.status(401).json({ error: 'Token non valido o corrotto' });
  }
}

module.exports = authJWE;

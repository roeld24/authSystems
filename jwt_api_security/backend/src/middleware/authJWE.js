const TokenUtils = require('../utils/tokenUtils');

async function authJWE(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    console.log('AuthHeader:', authHeader);
    console.log('Token estratto:', token);

    // Usa il metodo corretto dal TokenUtils
    const payload = await TokenUtils.verifyJWE(token); 
    req.user = payload;

    next();
  } catch (error) {
    console.error('JWE auth error:', error);
    res.status(401).json({ error: 'Token non valido o corrotto' });
  }
}

module.exports = authJWE;

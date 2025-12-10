// src/routes/protected.routes.js
const express = require('express');
const router = express.Router();

const authJWT = require('../middleware/authJWT');
const authJWS = require('../middleware/authJWS');
const authJWE = require('../middleware/authJWE');

// Endpoint protetto con JWT
router.get('/jwt-protected', authJWT, (req, res) => {
  res.json({ message: 'Accesso consentito con JWT', user: req.user });
});

// Endpoint protetto con JWS
router.get('/jws-protected', authJWS, (req, res) => {
  res.json({ message: 'Accesso consentito con JWS', user: req.user });
});

// Endpoint protetto con JWE
router.get('/jwe-protected', authJWE, (req, res) => {
  res.json({ message: 'Accesso consentito con JWE', user: req.user });
});

module.exports = router;

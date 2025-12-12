// src/routes/protected.routes.js
const express = require('express');
const router = express.Router();

const authJWT = require('../middleware/authJWT');
const authJWS = require('../middleware/authJWS');
const authJWE = require('../middleware/authJWE');

router.get('/jwt-protected', authJWT, (req, res) => {
    res.json({ message: 'Access granted with JWT', user: req.user });
});

router.get('/jws-protected', authJWS, (req, res) => {
    res.json({ message: 'Access granted with JWS', user: req.user });
});

router.get('/jwe-protected', authJWE, (req, res) => {
    res.json({ message: 'Access granted with JWE', user: req.user });
});

module.exports = router;

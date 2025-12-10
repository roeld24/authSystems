const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Registrazione
router.post('/register', AuthController.register);

// Login (genera JWT, JWS, JWE)
router.post('/login', AuthController.login);

// Refresh token
router.post('/refresh', AuthController.refresh);

// JWK endpoint (chiave pubblica)
router.get('/jwk', AuthController.getJWK);

module.exports = router;
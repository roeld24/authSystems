const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate, rateLimit } = require('../middleware/auth.middleware');

// Public routes (con rate limiting)
router.post('/login', rateLimit({ maxRequests: 5, windowMs: 15*60*1000 }), 
    AuthController.login);

var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
    windowMs: 15*60*1000, // 15 minuti
    max: 100 // limita ogni IP a 100 richieste per windowMs
});

router.use(limiter);

// Protected routes
router.post('/refresh', authenticate, AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/password-requirements', AuthController.getPasswordRequirements);

module.exports = router;

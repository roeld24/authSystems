const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const TokenUtils = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({
                    error: 'Username, email and password are mandatory'
                });
            }
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email already in use'
                });
            }
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(409).json({
                    error: 'Username already in use'
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await User.create(username, email, hashedPassword);
            res.status(201).json({
                message: 'User registered successfully',
                userId
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Error while registering' });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are mandatory' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credentials not valid' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credentials not valid' });
            }

            const payload = { userId: user.id, username: user.username, email: user.email };
            const jwtToken = TokenUtils.generateJWT(payload);
            const jwsToken = await TokenUtils.generateJWS(payload);
            const jweToken = await TokenUtils.generateJWE(payload);
            const refreshToken = TokenUtils.generateRefreshToken({ userId: user.id });

            // LOG PER VERIFICA SCADENZA DEL REFRESH TOKEN
            const decoded = jwt.decode(refreshToken, { complete: true });
            console.log('Generated refresh token:', refreshToken);
            console.log('Token exp (timestamp):', decoded.payload.exp, 'Now:', Math.floor(Date.now()/1000));

            res.json({
                message: 'Login successful',
                user: { id: user.id, username: user.username, email: user.email },
                tokens: { jwt: jwtToken, jws: jwsToken, jwe: jweToken, refreshToken },
                tokenInfo: {
                    jwt: 'Standard Token, with symmetric signature (HS256)',
                    jws: 'Token with asymmetric signature (RS256) - more secure',
                    jwe: 'Encrypted Token - Unreadable payload',
                    refreshToken: 'Long-lived token to obtain new tokens'
                }
            });

        } catch (error) {
            console.error('Errore login:', error);
            res.status(500).json({ error: 'Login error' });
        }
    }

    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'Missing refresh token' });
            }

            const decoded = TokenUtils.verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const payload = { userId: user.id, username: user.username, email: user.email };
            const newJwt = TokenUtils.generateJWT(payload);
            const newJws = await TokenUtils.generateJWS(payload);
            const newJwe = await TokenUtils.generateJWE(payload);

            res.json({
                message: 'Renewed tokens...',
                tokens: { jwt: newJwt, jws: newJws, jwe: newJwe }
            });

        } catch (error) {
            console.error('Refresh error:', error);
            res.status(401).json({ error: 'Refresh token not valid' });
        }
    }

    static async getJWK(req, res) {
        try {
            const jwk = await TokenUtils.getPublicJWK();
            res.json({ keys: [jwk] });
        } catch (error) {
            console.error('JWK error:', error);
            res.status(500).json({ error: 'Errore in JWK recovery' });
        }
    }
}

module.exports = AuthController;

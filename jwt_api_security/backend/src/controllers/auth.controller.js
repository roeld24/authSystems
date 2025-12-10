const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const TokenUtils = require('../utils/tokenUtils');

class AuthController {
  // ===== REGISTRAZIONE =====
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validazione base
      if (!username || !email || !password) {
        return res.status(400).json({ 
          error: 'Username, email e password sono obbligatori' 
        });
      }

      // Controlla se utente esiste già
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email già registrata' 
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ 
          error: 'Username già in uso' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea utente
      const userId = await User.create(username, email, hashedPassword);

      res.status(201).json({
        message: 'Utente registrato con successo',
        userId
      });

    } catch (error) {
      console.error('Errore registrazione:', error);
      res.status(500).json({ error: 'Errore durante la registrazione' });
    }
  }

  // ===== LOGIN CON TUTTI I TIPI DI TOKEN =====
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validazione
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email e password sono obbligatori' 
        });
      }

      // Trova utente
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Credenziali non valide' 
        });
      }

      // Verifica password

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Credenziali non valide' 
        });
      }

      // Payload per i token
      const payload = {
        userId: user.id,
        username: user.username,
        email: user.email
      };

      // Genera TUTTI i tipi di token
      const jwt = TokenUtils.generateJWT(payload);
      const jws = await TokenUtils.generateJWS(payload);
      const jwe = await TokenUtils.generateJWE(payload);
      const refreshToken = TokenUtils.generateRefreshToken({ userId: user.id });

      res.json({
        message: 'Login effettuato con successo',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        tokens: {
          jwt: jwt,           // Token standard (HS256)
          jws: jws,           // Token firmato asimmetricamente (RS256)
          jwe: jwe,           // Token cifrato
          refreshToken: refreshToken
        },
        tokenInfo: {
          jwt: 'Token standard con firma simmetrica (HS256)',
          jws: 'Token con firma asimmetrica (RS256) - più sicuro',
          jwe: 'Token cifrato - payload non leggibile',
          refreshToken: 'Token per rinnovare l\'accesso'
        }
      });

    } catch (error) {
      console.error('Errore login:', error);
      res.status(500).json({ error: 'Errore durante il login' });
    }
  }

  // ===== REFRESH TOKEN =====
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token mancante' });
      }

      // Verifica refresh token
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);

      // Trova utente
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      // Genera nuovi token
      const payload = {
        userId: user.id,
        username: user.username,
        email: user.email
      };

      const newJwt = TokenUtils.generateJWT(payload);
      const newJws = await TokenUtils.generateJWS(payload);
      const newJwe = await TokenUtils.generateJWE(payload);

      res.json({
        message: 'Token rinnovati',
        tokens: {
          jwt: newJwt,
          jws: newJws,
          jwe: newJwe
        }
      });

    } catch (error) {
      console.error('Errore refresh:', error);
      res.status(401).json({ error: 'Refresh token non valido' });
    }
  }

  // ===== JWK ENDPOINT (per chiave pubblica) =====
  static async getJWK(req, res) {
    try {
      const jwk = await TokenUtils.getPublicJWK();
      res.json({
        keys: [jwk]
      });
    } catch (error) {
      console.error('Errore JWK:', error);
      res.status(500).json({ error: 'Errore nel recupero JWK' });
    }
  }
}

module.exports = AuthController;
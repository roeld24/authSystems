const jwt = require('jsonwebtoken');
const { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt, exportJWK } = require('jose');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt.config');

class TokenUtils {
  // ===== 1. JWT STANDARD (HS256 - Symmetric) =====
  static generateJWT(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithms.symmetric
    });
  }

  static verifyJWT(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('Token JWT non valido');
    }
  }

  // ===== 2. JWS (RS256 - Asymmetric Signature) =====
  static async generateJWS(payload) {
    const privateKey = crypto.createPrivateKey(jwtConfig.privateKey);
    
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(privateKey);
    
    return jws;
  }

  static async verifyJWS(token) {
    try {
      const publicKey = crypto.createPublicKey(jwtConfig.publicKey);
      const { payload } = await jwtVerify(token, publicKey, {
        algorithms: ['RS256']
      });
      return payload;
    } catch (error) {
      throw new Error('Token JWS non valido: ' + error.message);
    }
  }

  // ===== 3. JWE (Encrypted JWT) =====
  static async generateJWE(payload) {
    const secret = new TextEncoder().encode(jwtConfig.jweSecret);
    
    const jwe = await new EncryptJWT(payload)
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .encrypt(secret);
    
    return jwe;
  }

  static async verifyJWE(token) {
    try {
      const secret = new TextEncoder().encode(jwtConfig.jweSecret);
      const { payload } = await jwtDecrypt(token, secret);
      return payload;
    } catch (error) {
      throw new Error('Token JWE non valido: ' + error.message);
    }
  }

  // ===== 4. JWK (JSON Web Key) =====
  static async getPublicJWK() {
    const publicKey = crypto.createPublicKey(jwtConfig.publicKey);
    const jwk = await exportJWK(publicKey);
    
    return {
      ...jwk,
      kid: 'key-1', // Key ID
      use: 'sig',   // Signature
      alg: 'RS256'
    };
  }

  // ===== Refresh Token (semplice JWT) =====
  static generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
      throw new Error('Refresh token non valido');
    }
  }
}

module.exports = TokenUtils;
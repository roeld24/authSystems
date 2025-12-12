const fs = require('fs');
const path = require('path');

module.exports = {
    // JWT Symmetric (HS256)
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '5s',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '10s',

    // JWT Asymmetric (RS256) - JWS
    privateKey: fs.readFileSync(
        path.join(__dirname, '../../keys/private.pem'),
        'utf8'
    ),
    publicKey: fs.readFileSync(
        path.join(__dirname, '../../keys/public.pem'),
        'utf8'
    ),

    // JWE
    jweSecret: process.env.JWE_SECRET,

    // Algoritmi
    algorithms: {
        symmetric: 'HS256',    // JWT standard
        asymmetric: 'RS256',   // JWS (firma asimmetrica)
        encryption: 'A256GCM'  // JWE (cifratura)
    }
};

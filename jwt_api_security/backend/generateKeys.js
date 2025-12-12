const fs = require('fs');
const { generateKeyPairSync } = require('crypto');

console.log('RSA key generation...');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

if (!fs.existsSync('./keys')) {
    fs.mkdirSync('./keys');
}

// Salva i file
fs.writeFileSync('./keys/public.pem', publicKey);
fs.writeFileSync('./keys/private.pem', privateKey);

console.log('Keys successfully generated!');

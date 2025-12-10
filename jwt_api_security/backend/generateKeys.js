const fs = require('fs');
const { generateKeyPairSync } = require('crypto');

console.log('Generazione chiavi RSA...');

// Genera coppia RSA direttamente da Node
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

// Crea cartella se manca
if (!fs.existsSync('./keys')) {
  fs.mkdirSync('./keys');
}

// Salva i file
fs.writeFileSync('./keys/public.pem', publicKey);
fs.writeFileSync('./keys/private.pem', privateKey);

console.log('Chiavi generate con successo!');

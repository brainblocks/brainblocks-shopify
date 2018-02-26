const crypto = require('crypto')
const algorithm = 'aes-256-ctr'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

const IV_LENGTH = 16

function encrypt (text) {
  const iv = crypto.randomBytes(IV_LENGTH).toString('hex');
  console.log('iv',iv);
  console.log('iv.toString()',iv.toString());
  const key = iv + ':' + ENCRYPTION_KEY
  const cipher = crypto.createCipher(algorithm, key)
  let crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return iv + ':' + crypted;
}

function decrypt (text) {
  const parts = text.split(':')
  const key = parts[0] + ':' + ENCRYPTION_KEY
  text = parts[1]
  console.log('key',key);
  console.log('text',text);
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
  encrypt,
  decrypt
}
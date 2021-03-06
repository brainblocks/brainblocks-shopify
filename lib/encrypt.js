const crypto = require('crypto')
const config = require('../config.json')
const algorithm = 'aes-256-ctr'

const ENCRYPTION_KEY = config.encryptionKey

const IV_LENGTH = 16

function encrypt (text) {
  const iv = crypto.randomBytes(IV_LENGTH).toString('hex');
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
  var decipher = crypto.createDecipher(algorithm, key)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
  encrypt,
  decrypt
}
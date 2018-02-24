const request = require('superagent')

function getToken (token, done) {
  //Check with brainblocks to verify this token
  request.get('https://brainblocks.io/api/session/' + token + '/verify')
    .then((response) => {
      let bbData = JSON.parse(response.text)
      return done(null, bbData)
    })
    .catch((err) => {
      done(err)
    })

}

function confirmPayment (token, amount, currency, done) {

  
  getToken(token, (err, result) => {
    //TODO: Actually check against brainblocks
    return done(null, true)


    if (err) {
      return done(err)
    }

    if (result.amount.toString() != amount.toString()) {
      return done(new Error('BrainBlocks amount ' + result.amount + ' does not match order amount ' + amount))
    }

    if (result.currency.toString() != currency.toString()) {
      return done(new Error('BrainBlocks currency ' + result.currency + ' does not match order currency ' + currency))
    }

    return done(null, true)
  })
}

module.exports = {
  getToken,
  confirmPayment
}
const request = require('superagent')

function getToken (token, done) {
  //Check with brainblocks to verify this token
  const url = 'https://brainblocks.io/api/session/' + token + '/verify'
  console.log('url',url);
  request.get(url)
    .then((response) => {
      console.log('response.body',response.body);
      let bbData = JSON.parse(response.text)
      return done(null, bbData)
    })
    .catch((err) => {
      console.log('err',err);
      done(err)
    })

}

function confirmPayment (token, amount, currency, destination, done) {
  getToken(token, (err, result) => {
    if (err) {
      return done(err)
    }

    if (result.status == 'error') {
      return done(new Error(result.message))
    }

    if (result.amount.toString() != amount.toString()) {
      return done(new Error('BrainBlocks amount ' + result.amount + ' does not match order amount ' + amount))
    }

    if (result.destination != destination) {
      return done(new Error('Destination address does not match'))
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
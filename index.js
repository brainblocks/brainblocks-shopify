const request       = require('superagent')
const express       = require('express')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const async         = require('async')

const Code = require('./models/code')
const shopify = require('./lib/shopify')
const die = require('./lib/die')
const currencies = require('./lib/currencies')
const config = require('./config.json')
const symbols = require('./lib/symbols')

const MONGODB_URI = config.mongodbURI

if (!MONGODB_URI) {
  die('MONGODB_URI not set in config')
}

const NANO_DESTINATION = config.nanoDestination;
console.log('NANO_DESTINATION', NANO_DESTINATION);

if (!NANO_DESTINATION) {
  die('NANO_DESTINATION not set in config.')
}

const CURRENCY = config.currency || 'usd'
const SYMBOL = config.symbol || symbols[CURRENCY.toUpperCase()] || '$'

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  die('MongoDB connection error. Please make sure MongoDB is running at ' + MONGODB_URI)
});


const app = express()
const port = config.port || 4800

app.use(express.static('public'))
app.use(bodyParser.json())
app.set('view engine', 'pug')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/pay', (req, res) => {
  res.render('pay', {
    destination: NANO_DESTINATION,
    currency: CURRENCY,
    symbol: SYMBOL,
    title: config.pageTitle
  })
})

app.post('/create-code', (req, res) => {
  function sendCode (code) {
    return res.status(200).send(code)
  }

  async.waterfall([(next) => {
    //If we've already created a code for this token we return that one
    Code.findOne({brainblocksToken: req.body.token}, (err, code) => {
      console.log('code',code);
      if (err) {
        return next(err)
      }

      if (code) {
        return sendCode(code)
      }

      next(null)
    })
  }, (next) => {
    //Check with brainblocks to verify this token
    request.get('https://brainblocks.io/api/session/' + req.body.token + '/verify')
      .then((response) => {
        let bbData = JSON.parse(response.text)
        console.log('bbData', bbData);

        let errors = []

        console.log('typeof(bbData.amount)',typeof(bbData.amount));
        console.log('typeof(req.body.amount)',typeof(req.body.amount));
        console.log('bbData.amount',bbData.amount);
        console.log('req.body.amount',req.body.amount);

        const bodyAmount = req.body.amount.toString()

        if (bbData.amount !== bodyAmount) {
          errors.push('BrainBlocks amount (' + bbData.amount + ') does not match entered amount (' + bodyAmount + ')')
        }

        if (bbData.currency !== CURRENCY) {
          errors.push('BrainBlocks currency (' + bbData.currency + ') does not match shop currency (' + CURRENCY + ')')
        }

        if (errors.length) {
          return next(errors)
        }

        return next(null, bbData)
      })
      .catch((err) => {
        next(err)
      })
  }, (bbData, next) => {
    //Create the code in Shopify
    shopify.createCode(bbData.amount, (err, result) => {
      if (err) {
        return next([err.toString()])
      }

      sendCode({
        shopifyCode: result.title,
        amount: bbData.amount,
        currency: bbData.currency
      })

      //TODO: Log errors
      Code.create({
        brainblocksToken: req.body.token,
        shopifyCode: result.title,
        currency: CURRENCY,
        amount: req.body.amount
      })
    })
  }], (errors) => {
    if (errors) {
      if (typeof errors == 'string') {
        errors = [errors]
      }
      res.status(500).send({errors: errors})
    }
  })
})

app.listen(port, () => {
  console.log('Example app listening on port ' + port + '!')
})


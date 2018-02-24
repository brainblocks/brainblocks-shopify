const request       = require('superagent')
const express       = require('express')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const async         = require('async')

const Code = require('./models/code')
const shopify = require('./lib/shopify')
const brainblocks = require('./lib/brainblocks')
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

app.get('/', (req, res) => {
  res.render('pay', {
    destination: NANO_DESTINATION,
    currency: CURRENCY,
    symbol: SYMBOL,
    title: config.pageTitle
  })
})

app.get('/orders', (req, res) => {
  shopify.getOrders((err, orders) => {
    res.send(orders)
  })
})

app.get('/order/:shopifyToken', (req, res) => {
  shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
    if (err) {
      return res.status(500).send({
        error: err.toString()
      })
    }
    res.send(shopify.sanitizeOrder(order))
  })
})

app.post('/order/:shopifyToken/confirm/:brainblocksToken', (req, res) => {
  async.waterfall([(next) => {
    shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
      if (err) {
        return next(err)
      }

      next(null, order)
    })
  }, (order, next) => {
    brainblocks.confirmPayment(req.params.shopifyToken, order.total_price, config.currency, (err, confirmed) => {
      if (err) {
        return next(err)
      }
      if (confirmed) {
        next(null, order)
      }
    })
  }, (order, next) => {
    shopify.updateToPaid(order.id, order.total_price, (err) => {
      if (err) {
        return next(err)
      }

      return next(null)
    })
  }], (err) => {
    console.log('err',err);
    if (err) {
      return res.status(500).send({
        error: err.toString()
      })
    }
    res.status(200).send({confirmed: true})
  })
})

app.post('/create-code', (req, res) => {
  function sendCode (code) {
    return res.status(200).send(code)
  }

  async.waterfall([(next) => {
    //If we've already created a code for this token we return that one
    Code.findOne({brainblocksToken: req.body.token}, (err, code) => {
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

        let errors = []


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
  console.log('Listening on port ' + port + '!')
})


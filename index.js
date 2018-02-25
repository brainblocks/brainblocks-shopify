const request       = require('superagent')
const express       = require('express')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const async         = require('async')

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

function sendError (res, err) {
  return res.status(500).send({
    error: err.toString()
  })
}

app.use(express.static('public'))
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  const endpoint = 'https://' + req.get('host')
  res.render('setup.html', {
    destination: NANO_DESTINATION,
    currency: CURRENCY,
    endpoint: endpoint,
    src: endpoint + '/checkout.js'
  })
})


//Get info of an order from its token
app.get('/order/:shopifyToken', (req, res) => {
  shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
    if (err) {
      return sendError(res, err)
    }
    res.send(shopify.sanitizeOrder(order))
  })
})

app.post('/order/:shopifyToken/confirm/:brainblocksToken', (req, res) => {
  async.waterfall([(next) => {
    //Fetch order from Shopify based on token
    shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
      if (err) {
        return next(err)
      }

      console.log('order.financial_status',order.financial_status);
      next(null, order)
    })
  }, (order, next) => {
    //Confirm that the brainblocks payment amount matches the order amount
    brainblocks.confirmPayment(req.params.brainblocksToken, order.total_price, config.currency, (err, confirmed) => {
      if (err) {
        return next(err)
      }
      if (confirmed) {
        next(null, order)
      }
    })
  }, (order, next) => {
    //Mark the order as paid in Shopify
    shopify.updateToPaid(order.id, order.total_price, (err) => {
      if (err) {
        return next(err)
      }

      return next(null)
    })
  }], (err) => {
    if (err) {
      return sendError(res, err)
    }
    res.status(200).send({confirmed: true})
  })
})

app.listen(port, () => {
  console.log('Listening on port ' + port + '!')
})


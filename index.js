const request       = require('superagent')
const express       = require('express')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const async         = require('async')
const crypto        = require('crypto');

const Shopify = require('./lib/shopify')
const brainblocks = require('./lib/brainblocks')
const die = require('./lib/die')
const currencies = require('./lib/currencies')
const config = require('./config.json')
const symbols = require('./lib/symbols')
const Shop = require('./models/shop')
const encryption = require('./lib/encrypt')

const MONGODB_URI = config.mongodbURI

if (!MONGODB_URI) {
  die('MONGODB_URI not set in config')
}

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length != 32) {
  die('process.env.ENCRYPTION_KEY must be 32 characters long. Current value: "' + process.env.ENCRYPTION_KEY + '" len:' +  process.env.ENCRYPTION_KEY.length)
}

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

//Gets a shopify API thing based on given :shopKey param
function shopifyMiddleware (req, res, next) {
  if (!req.params.shopKey) {
    next(new Error('Shop key missing'))
  }

  Shop.findOne({
    key: req.params.shopKey
  }, (err, shop) => {
    if (err) {
      return next(err)
    }

    if (!shop) {
      return next(new Error('No registered shop found with that shopKey'))
    }

    req.shop = shop
    req.shopify = new Shopify(shop.endpoint, shop.username, shop.password)
    next(null)
  })
}

app.use(express.static('public'))
app.use(bodyParser.json())
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'pug')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.render('register', {
    currencies: currencies
  })
})

app.post('/register', (req, res) => {
  const endpoint = req.body.shopUrl + '/admin'
  const shopify = new Shopify(endpoint, req.body.apiKey, req.body.password)

  let errors = []

  if (!req.body.apiKey) {
    errors.push('API Key is required')
  }
  if (!req.body.password) {
    errors.push('Password is required')
  }
  if (!req.body.currency) {
    errors.push('Currency is required')
  }
  if (!req.body.shopUrl) {
    errors.push('Shop URL is required')
  }
  if (!req.body.destination) {
    errors.push('Destination is required')
  }
  else if (req.body.destination.substr(0, 4) != 'xrb_') {
    errors.push('Destination does not look correct')
  }

  if (errors.length) {
    return sendError(res, errors)
  }

  shopify.getOrders((err, orders) => {
    if (err) {
      return sendError(res, new Error('Error connecting to Shopify. Double check shop url, API key, and password.'))
    }

    const key = crypto.createHash('md5').update(endpoint + '_' + new Date().getTime()).digest("hex");

    Shop.create({
      key: key,
      endpoint: endpoint,
      username: encryption.encrypt(req.body.apiKey),
      password: encryption.encrypt(req.body.password),
      destination: req.body.destination,
      currency: req.body.currency
    }, (err, shop) => {
      if (err) {
        return sendError(res, err)
      }

      const appUrl = 'https://' + req.get('host')
      res.send({
        endpoint: appUrl, //Endpoint of this app
        currency: shop.currency,
        key: shop.key,
        src: appUrl + '/checkout.js',
        destination: shop.destination
      }).status(200)
    })
  })
})

//Get info of an order from its token
app.get('/:shopKey/order/:shopifyToken', shopifyMiddleware, (req, res) => {
  req.shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
    if (err) {
      return sendError(res, err)
    }
    res.send(req.shopify.sanitizeOrder(order))
  })
})

app.post('/:shopKey/order/:shopifyToken/confirm/:brainblocksToken', shopifyMiddleware, (req, res) => {
  async.waterfall([(next) => {
    //Fetch order from Shopify based on token
    req.shopify.getOrderByToken(req.params.shopifyToken, (err, order) => {
      if (err) {
        return next(err)
      }

      next(null, order)
    })
  }, (order, next) => {
    //Confirm that the brainblocks payment amount matches the order amount
    brainblocks.confirmPayment(req.params.brainblocksToken, order.total_price, req.shop.currency, req.shop.destination, (err, confirmed) => {
      if (err) {
        return next(err)
      }
      if (confirmed) {
        next(null, order)
      }
    })
  }, (order, next) => {
    //Mark the order as paid in Shopify
    req.shopify.updateToPaid(order.id, order.total_price, (err) => {
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


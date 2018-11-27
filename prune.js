const mongoose      = require('mongoose')
const async         = require('async')

const die = require('./lib/die')
const config = require('./config.json')
const Order = require('./models/order')
const Shopify = require('./lib/shopify')

const MONGODB_URI = config.mongodbURI
config.encryptionKey = config.encryptionKey || ""

if (!MONGODB_URI) {
  die('MONGODB_URI not set in config')
}

if (!config.encryptionKey || config.encryptionKey.length != 32) {
  die('encryptionKey in config must be 32 characters long. Current value: "' + config.encryptionKey + '" len:' +  config.encryptionKey.length)
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  die('MongoDB connection error. Please make sure MongoDB is running at ' + MONGODB_URI)
});

const seconds = config.cancelOrderAfter || (60 * 5)
const cutoff = new Date(new Date().getTime() - (1000 * seconds))
let agg = [{
  $match: {
    status: 'pending',
    createdAt: {
      $lt: cutoff
    }
  }
}, {
  $lookup: {
    from: 'shops',
    localField: 'shopId',
    foreignField: '_id',
    as: 'shop'
  }
}]
Order.aggregate(agg, (err, orders) => {
  async.each(orders, (order, next) => {
    console.log('order',order);
    let shop = order.shop[0]
    if (!shop) {
      console.log('ERROR: No shop found for this order', order);
      return next()
    }
    let shopify = new Shopify(shop.endpoint, shop.username, shop.password)
    shopify.cancelOrder(order.orderId, (err) => {
      if (err) {
        return next(err)
      }

      console.log('Pruned order ' + order.orderId + ' for ' + shop.endpoint)
      Order.update({orderId: order.orderId}, {$set: {status: 'cancelled'}}, next)
    })

  }, () => {
    process.exit()
  })
})

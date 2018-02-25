const request = require('superagent')
const shortid  = require('shortid32');

const die = require('./die')
const config = require('../config.json')

function Shopify (endpoint, username, password) {
  this.endpoint = endpoint
  this.username = username
  this.password = password
}


/**
 * Helper for creating API requests to shopify
 *
 * @param {String} method
 * @param {String} url
 * @returns {Object}
 */
Shopify.prototype.shopifyRequest = function (method, url) {
  return request[method](this.endpoint + url)
    .auth(this.username, this.password)
}

/**
 * Get an order by a token
 * Token can be either order token or order checkout_token
 *
 * @param {String} token order.token OR order.checkout_token
 * @param {Function} done
 */
Shopify.prototype.getOrderByToken = function (token, done) {
  this.getOrders((err, orders) => {
    if (err) {
      return done(err)
    }

    for(let i = 0; i < orders.length; i++) {
      let order = orders[i]
      if (order.token == token || order.checkout_token == token) {
        return done(null, order)
      }
    }
    return done(new Error('Could not find order'))
  })
}

/**
 * Gets 50 most recent orders from Shopify
 *
 * @param {Function} done
 */
Shopify.prototype.getOrders = function (done) {
 this.shopifyRequest('get', '/orders.json')
  .end((err, result) => {
    if(err) {
      return done(err)
    }
    const body = JSON.parse(result.text)
    if(result.status !== 200) {
      return done(body.errors)
    }
    return done(null, body.orders)
  })
}

/**
 * Returns only the needed fields of an order
 *
 * @param {Object} order
 * @returns {Object} order
 */
Shopify.prototype.sanitizeOrder = function (order) {
  return {
    total_price: order.total_price,
    financial_status: order.financial_status,
    token: order.token,
    checkout_token: order.checkout_token
  }
}

/**
 * Creates a new transaction for an error for the given amount
 *
 * @param {Number} orderId
 * @param {Number|String} amount, in the currency of the store
 * @param {Function} done
 */
Shopify.prototype.updateToPaid = function (orderId, amount, done) {
 this.shopifyRequest('post', '/orders/' + orderId + '/transactions.json')
  .send({"transaction": {
    "amount": amount.toString(),
    "kind": "capture"
  }})
  .end((err, result) => {
    if (err) {
      return done(err)
    }
    done(err, result.body)
  })
}

module.exports = Shopify

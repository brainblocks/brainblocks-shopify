const request = require('superagent')
const shortid  = require('shortid32');

const die = require('./die')
const config = require('../config.json')

const SHOPIFY_ENDPOINT = config.shopify.endpoint
const SHOPIFY_USERNAME = config.shopify.username
const SHOPIFY_PASSWORD = config.shopify.password

if (!SHOPIFY_ENDPOINT) {
  die('Missing shopify.endpoint in config')
}

if (!SHOPIFY_USERNAME) {
  die('Missing shopify.username in config')
}

if (!SHOPIFY_PASSWORD) {
  die('Missing shopify.password in config')
}

/**
 * Helper for creating API requests to shopify
 *
 * @param {String} method
 * @param {String} url
 * @returns {Object}
 */
function shopifyRequest (method, url) {
  return request[method](SHOPIFY_ENDPOINT + url)
    .auth(SHOPIFY_USERNAME, SHOPIFY_PASSWORD)
}

/**
 * Get an order by a token
 * Token can be either order token or order checkout_token
 *
 * @param {String} token order.token OR order.checkout_token
 * @param {Function} done
 */
function getOrderByToken (token, done) {
  getOrders((err, orders) => {
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
function getOrders (done) {
 shopifyRequest('get', '/orders.json')
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
function sanitizeOrder (order) {
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
function updateToPaid (orderId, amount, done) {
 shopifyRequest('post', '/orders/' + orderId + '/transactions.json')
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

module.exports = {
  getOrderByToken,
  getOrders,
  sanitizeOrder,
  updateToPaid
}
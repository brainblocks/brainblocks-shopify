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
 * Generates a new PriceRule (aka Discount Count) in the Shop
 *
 * @param {Object} opts
 * @param {String} opts.code The code the user enters
 * @param {Date} opts.start_date
 */
function createCode (amount, done) {
  let rule =  {
    "title": "nano-" + shortid.generate(),
    "target_type": "line_item",
    "target_selection": "all",
    "allocation_method": "across",
    "value_type": "fixed_amount",
    "customer_selection": "all",
    "oncer_per_cusomter": true,
    "usage_limit": 1,
    "starts_at": new Date()
  };

  rule.value = amount * -1;
  rule.ends_at = new Date(new Date().getTime() + (1000 * 60 * 60)); //Code lasts for 1 hour

  request
    .post(`${SHOPIFY_ENDPOINT}/price_rules.json`)
    .send({price_rule: rule})
    .auth(SHOPIFY_USERNAME, SHOPIFY_PASSWORD)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      if(!res.body || !res.body.price_rule || !res.body.price_rule.id) {
        return done(new Error('No price_rule found after creation.'))
      }

      const priceRuleId = res.body.price_rule.id;
      request
        .post(`${SHOPIFY_ENDPOINT}/price_rules/${priceRuleId}/discount_codes.json`)
        .send({
            discount_code: {
              code: rule.title,
              price_rule_id: priceRuleId
            }
        })
        .auth(SHOPIFY_USERNAME, SHOPIFY_PASSWORD)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done(null, rule)
        })
    });
}

module.exports = {
  createCode
}
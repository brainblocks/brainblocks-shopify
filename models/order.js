const mongoose = require('mongoose');
const Schema = mongoose.Schema

const orderSchema = new Schema({
  orderToken: {
    type: String,
    index: true
  },
  orderCheckoutToken: {
    type: String,
    index: true
  },
  orderId: {
    type: Number,
    index: true
  },
  brainblocksToken: {
    type: String,
    index: true
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

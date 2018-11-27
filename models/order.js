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
  shopId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  brainblocksToken: {
    type: String,
    index: true
  }, 
  status: {
    type: String,
    allowNull: false,
    index: true,
    defaultValue: 'pending'
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const shopSchema = new Schema({
  key: {
    type: String,
    index: true
  },
  endpoint: String,
  username: String,
  password: String,
  currency: String,
  destination: String
}, { timestamps: true });

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;

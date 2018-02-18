const mongoose = require('mongoose');
const Schema = mongoose.Schema

const codeSchema = new Schema({
  shopifyCode: {
    type: String,
    index: true
  },
  brainblocksToken: {
    type: String,
    index: true
  },
  currency: String,
  amount: Number
}, { timestamps: true });

const Code = mongoose.model('Code', codeSchema);

module.exports = Code;

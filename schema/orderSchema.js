const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }],
  customer: { type: schema.Types.ObjectId, required: true, ref: 'customer' },
  sales_executive: { type: schema.Types.ObjectId, required: true, ref: 'user' },
  totalAmount : { type: Number, required: true },
  status : { type: String, required: true },
  createdAt: { type: Date,  default: Date.now },
  updated_at: { type: Date },
});

module.exports = Order = mongoose.model('order', orderSchema);
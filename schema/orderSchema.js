const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema({
  order_id: { type: String, unique: true, required: true },
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      batch_no: { type: String },
      s_gst: { type: Number, required: true, default: 0 },
      c_gst: { type: Number, required: true, default: 0 },
      hsn_code: { type: String },
    },
  ],
  customer: { type: schema.Types.ObjectId, required: true, ref: 'customer' },
  advisor_name: { type: schema.Types.ObjectId, required: true, ref: 'user' },
  total_amount: { type: Number, required: true },
  order_type: { type: String, default: 'confirm', enum: ['confirm', 'future'] },
  future_order_date: { type: Date, required: false },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'coupon' },
  mark_as_done:{type:Boolean},
  mark_as_return:{type:Boolean,default:false},
  status: { type: String, default: 'confirm', required: false, enum: ['confirm', 'cancel', 'return', null] },
  added_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

orderSchema.pre('save', async function (next) {
  try {
    const existingOrder = await mongoose.model('order').findOne({ order_id: this.order_id });
    if (existingOrder) {
      const error = new Error('Order ID must be unique');
      return next(error);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = Order = mongoose.model('order', orderSchema);
const mongoose = require('mongoose');
const schema = mongoose.Schema;

// define order status constants early so they can be used in schema definitions
const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRM: "confirm",
  CANCEL: "cancel",
  PACKING: "packing",
  READY_TO_SHIP: "ready to ship",
  DISPATCHED: "dispatched",
  IN_TRANSIT: "in transit", // added so controller logic can reference this value
  DELIVERED: "delivered",
  LOST: "lost",
  RETURN: "return"
});

const orderSchema = new schema({
  order_id: { type: String, unique: true, required: true },
  delivery_through: { type: String, required: false },
  tracking_number: { type: String, required: false },
  delivery_by: { type: String, required: false },
  status: { type: String, default: 'pending', required: false, enum: [...Object.values(ORDER_STATUS), null] },
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
  is_confirmed: { type: Boolean,default: false},
  customer: { type: schema.Types.ObjectId, required: true, ref: 'customer' },
  advisor_name: { type: schema.Types.ObjectId, required: true, ref: 'user' },
  total_amount: { type: Number, required: true },
  round_off: { type: Number, default: 0 },
  order_type: { type: String, default: 'confirm', enum: ['confirm', 'future'] },
  future_order_date: { type: Date, required: false },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'coupon' },
  mark_as_done:{type:Boolean},
  mark_as_return:{type:Boolean,default:false},
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

// attach the status constants to the model so that require() callers
// can access them without breaking the default export.
const Order = mongoose.model('order', orderSchema);
Order.ORDER_STATUS = ORDER_STATUS;

module.exports = Order;  // default export is the model itself

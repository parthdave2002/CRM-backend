const mongoose = require('mongoose');
const schema = mongoose.Schema;

const couponSchema = new schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  is_active: { type: Boolean, required: true, default: true },
  added_at: { type: Date, default: Date.now },
  is_deleted: { type: Boolean, default: false },
});

module.exports = Coupon = mongoose.model('coupon', couponSchema);

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema({
  name: { type: String, required: true,unique: true  },
  description: { type: String, required: true, },
  product_pic: { type: String, default: null },
  batch_no: {  type: Number, required: true, default: 0 },
  hsn_code: {  type: Number, required: true, default: 0 },
  gst: { type: Number, required: true, default: 0},
  discount: { type: Number, required: true, default: 0},
  avl_qty: { type: Number, required: true, default: 0},
  price: { type: Number, required: true, default: 0},
  rating: { type: Number,  default: 0},
  category: { type: schema.Types.ObjectId, required: true, ref: 'category' },
  packaging :{ type: schema.Types.ObjectId, required: true, ref: 'packaging'},
  is_active: { type: Boolean, required: true, default: false },
  is_deleted: { type: Boolean, default: false },
  createdAt: { type: Date,  default: Date.now },
  updated_at: { type: Date },
  deleted_by: { type: schema.Types.ObjectId},
  deleted_at: {type: Date},
});

module.exports = Product = mongoose.model('product', productSchema);
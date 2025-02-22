const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema({
  name: { type: String, required: true,unique: true  },
  tech_name: { type: String, required: true,unique: true  },
  packaging :{ type: schema.Types.ObjectId, required: true, ref: 'packing-type'},
  price: { type: Number, required: true, default: 0},
  discount: { type: Number, required: true, default: 0},
  product_pic: { type: String, default: null },
  category: { type: schema.Types.ObjectId, required: true, ref: 'category' },
  batch_no: {  type: Number, required: true, default: 0 },
  hsn_code: {  type: Number, required: true, default: 0 },
  s_gst: { type: Number, required: true, default: 0},
  c_gst: { type: Number, required: true, default: 0},
  avl_qty: { type: Number, required: true, default: 0},
  rating: { type: Number,  default: 0},
  description: { type: String, required: true, },
  is_active: { type: Boolean, required: true, default: false },
  is_deleted: { type: Boolean, default: false },
  added_at: { type: Date,  default: Date.now },
  updated_at: { type: Date },
  deleted_by: { type: schema.Types.ObjectId},
  deleted_at: {type: Date},
});

module.exports = Product = mongoose.model('product', productSchema);
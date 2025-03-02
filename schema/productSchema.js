const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema({
  name: {
    gujaratiname: { type: String, required: true, unique: true },
    englishname: { type: String, required: true, unique: true },
  },
  tech_name: {
    gujarati_tech_name: { type: String, required: true, unique: true },
    english_tech_name: { type: String, required: true, unique: true },
  },
  packaging: { type: Number },
  packagingtype: { type: schema.Types.ObjectId, required: true, ref: 'packing-type' },
  price: { type: Number, required: true, default: 0 },
  discount: { type: Number, required: true, default: 0 },
  product_pics: [{ type: String, default: null }],
  categories: { type: schema.Types.ObjectId, required: true, ref: 'categories' },
  company: { type: schema.Types.ObjectId, required: true, ref: 'company' },
  batch_no: { type: String },
  hsn_code: { type: String },
  s_gst: { type: Number, required: true, default: 0 },
  c_gst: { type: Number, required: true, default: 0 },
  avl_qty: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  description: [
    {
      // id: { type: Number, required: true },
      gujaratiHeader: { type: String, required: true },
      englishHeader: { type: String, required: true },
      gujaratiValue: { type: String, required: true },
      englishValue: { type: String, required: true },
    },
  ],
  is_active: { type: Boolean, required: true, default: false },
  is_deleted: { type: Boolean, default: false },
  added_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_by: { type: schema.Types.ObjectId },
  deleted_at: { type: Date },
});

module.exports = Product = mongoose.model('product', productSchema);
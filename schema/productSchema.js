const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema({
  name: {
    gujaratiname: { type: String, required: true,  trim: true},
    englishname: { type: String, required: true,  trim: true},
  },
  tech_name: {
    gujarati_tech_name: { type: String, trim: true},
    english_tech_name: { type: String, trim: true},
  },
  crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'crop', required: true }],
    isBestSelling: { type: Boolean, required: true, default: false },
  packaging: { type: Number },
  packagingtype: { type: mongoose.Schema.Types.ObjectId,required: true, ref: 'packing-type' },
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
      gujaratiHeader: { type: String, required: true , trim: true},
      englishHeader: { type: String, required: true, trim: true },
      gujaratiValue: { type: String, required: true, trim: true },
      englishValue: { type: String, required: true , trim: true},
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
 const mongoose = require('mongoose');
const schema = mongoose.Schema;

const customerSchema = new schema({
  firstname: { type: String, require: true },
  lastname: { type: String, require: true },
  middlename: { type: String, require: true },
  mobile_number: { type: Number },
  alternate_number: { type: Number },
  smart_phone: { type: Boolean },
  land_area: { type: String },
  land_type: { type: String, enum: ['acre', 'bigha', 'hacter'] },
  irrigation_source: { type: String, enum: ['borwell', 'canal', 'well', "other", "no source"] },
  irrigation_type: { type: String, enum: ['drip', 'flood', 'sprinkler'] },
  crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'crop', required: true }],
  heard_about_agribharat: { type: String, enum: ['newspaper', 'tv add', 'magazine', 'van campaign', 'facebook', 'youtube', 'instagram', 'whatsapp', 'linkedIn', 'brochure', 'shop', 'officer', 'other farmer'] },
  address: { type: String },
  district: { type: mongoose.Schema.Types.ObjectId },
  taluka: { type: mongoose.Schema.Types.ObjectId },
  village: { type: mongoose.Schema.Types.ObjectId },
  state: { type: mongoose.Schema.Types.ObjectId,  ref: 'State', },
  pincode: { type: String },
  post_office: { type: String },
  added_at: { type: Date },
  created_by: { type: schema.Types.ObjectId, ref: 'users' },
  updated_at: { type: Date },
  ref_name : {type:  Number, ref: 'customer'},
  updated_by: { type: schema.Types.ObjectId, ref: 'users' },
  is_deleted: { type: Boolean, default: false, required: true },
  deleted_by: { type: schema.Types.ObjectId, ref: 'users' },
  deleted_at: { type: Date },
});

customerSchema.virtual('customer_name').get(function () {
  return `${this.lastname?.trim() || ''}  ${this.firstname?.trim() || ''} ${this.middlename?.trim() || ''}`.trim();
});
customerSchema.set('toObject', { virtuals: true });
customerSchema.set('toJSON', { virtuals: true });

module.exports = customer = mongoose.model('customer', customerSchema);
// const mongoose = require('mongoose');
// const schema = mongoose.Schema;

// const customerSchema = new schema({
//   customer_name: { type: String },
//   mobile_number: { type: Number},
//   alternate_number: { type: Number },
//   smart_phone : { type: Boolean },
//   land_area: { type: String},
//   land_type : { type: String,  enum: ['acre', 'vigha']},
//   irrigation_source : { type: String,  enum: ['barwell', 'canal']},
//   irrigation_type : { type: String,  enum: ['drip', 'flood', 'sprinkler']},
//   crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'crop', required: [true, 'At least one crop is required'] }],
//   heard_about_agribharat : { type: String,  enum: ['newspaper', 'tv add', 'magazine', 'van campaign', 'facebook', 'Instagram', 'whatsapp', 'linkedIn', 'brochure', 'agri dukan', 'field officer']},
//   address: { type: String},
//   district: { type: String},
//   taluka: { type: String},
//   village: { type: String},
//   pincode: { type: String},
//   added_at: { type: Date },
//   created_by: { type: schema.Types.ObjectId, ref: 'users' },
//   updated_at: { type: Date },
//   updated_by: { type: schema.Types.ObjectId, ref: 'users' },
//   is_deleted: { type: Boolean, default: false, required: true },
//   deleted_by: { type: schema.Types.ObjectId, ref: 'users' },
//   deleted_at: { type: Date },
// });

// module.exports = customer = mongoose.model('customer', customerSchema)



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
  land_type: { type: String, enum: ['acre', 'vigha'] },
  irrigation_source: { type: String, enum: ['barwell', 'canal'] },
  irrigation_type: { type: String, enum: ['drip', 'flood', 'sprinkler'] },
  crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'crop', required: [true, 'At least one crop is required'] }],
  heard_about_agribharat: { type: String, enum: ['newspaper', 'tv add', 'magazine', 'van campaign', 'facebook', 'Instagram', 'whatsapp', 'linkedIn', 'brochure', 'agri dukan', 'field officer'] },
  address: { type: String },
  district: { type: String },
  taluka: { type: String },
  village: { type: String },
  pincode: { type: String },
  added_at: { type: Date },
  created_by: { type: schema.Types.ObjectId, ref: 'users' },
  updated_at: { type: Date },
  updated_by: { type: schema.Types.ObjectId, ref: 'users' },
  is_deleted: { type: Boolean, default: false, required: true },
  deleted_by: { type: schema.Types.ObjectId, ref: 'users' },
  deleted_at: { type: Date },
});

customerSchema.virtual('customer_name').get(function () {
  return `${this.firstName?.trim() || ''} ${this.lastName?.trim() || ''} ${this.surname?.trim() || ''}`.trim();
});
customerSchema.set('toObject', { virtuals: true });
customerSchema.set('toJSON', { virtuals: true });

module.exports = customer = mongoose.model('customer', customerSchema);
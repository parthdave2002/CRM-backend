const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const module_user_accessSchema = new Schema({
  module_id: { type: String },
  sub_module_id: { type: String },
  role_id: { type: String },
  access_name: { type: String },
  is_active: { type: Boolean, default: true, required: true },
  added_at: { type: Date, default: Date.now },
  added_by: { type: Schema.Types.ObjectId, ref: 'users' },
  updated_at: { type: Date, default: Date.now },
  updated_by: { type: Schema.Types.ObjectId, ref: 'users' },
});

module.exports = module_user_access = mongoose.model('module_user_accesses', module_user_accessSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const module_accessSchema = new Schema({
  module_id: { type: String },
  sub_module_id: { type: String },
  access_name: { type: String },
  server_route: { type: String },
  client_route: { type: String },
  restricted_menu : { type: Array },
  is_active: { type: Boolean, default: true, required: true },
  added_at: { type: Date },
  added_by: { type: Schema.Types.ObjectId, ref: 'users' },
  updated_at: { type: Date },
  updated_by: { type: Schema.Types.ObjectId, ref: 'users' },
  is_deleted:{type:Boolean, default: false},
});


module.exports = module_access = mongoose.model('module_accesses', module_accessSchema);

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const cropSchema = new schema({
  name_eng: { type: String, required: true },
  name_guj: { type: String, required: true },
  description_eng: { type: String },
  description_guj: { type: String },
  is_active: { type: Boolean, default: true},
  added_at: { type: Date, default: Date.now },
  updated_at: { type: Date},
  is_deleted: { type: Boolean, default: false}
});

module.exports = mongoose.model('crop', cropSchema);


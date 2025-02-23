const mongoose = require('mongoose');
const schema = mongoose.Schema;

const cropSchema = new schema({
  name: { type: String, required: true },
  description: { type: String },
  is_active: { type: Boolean},
  added_on: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Crop', cropSchema);


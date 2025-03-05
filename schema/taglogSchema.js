const mongoose = require('mongoose');
const schema = mongoose.Schema;

const taglogSchema = new schema({
  taglog_name: { type: String },
  is_active: { type:  Boolean, default: true, required: true},
  added_at: { type: Date, default: new Date()},
  updated_at: { type: Date },
  updated_by: { type: schema.Types.ObjectId, ref: 'users' },
  is_deleted: { type: Boolean, default: false },
  deleted_by: { type: schema.Types.ObjectId, ref: 'users' },
  deleted_at: { type: Date },
});

module.exports = Taglog = mongoose.model('taglog', taglogSchema);

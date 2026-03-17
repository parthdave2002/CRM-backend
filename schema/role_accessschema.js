const mongoose = require('mongoose');
const schema = mongoose.Schema;

const roleAccessSchema = new schema({
  role_id: { type: schema.Types.ObjectId, required: true, ref: 'role' },
  module_name: { type: String, required: true },
  permissions: {
        add: { type: Boolean, default: false },
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
  },
  added_at: { type: Date, default: Date.now },
  added_by: { type: schema.Types.ObjectId, ref: 'users' },
  updated_at: { type: Date, default: Date.now },
  updated_by: { type: schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('role_accesses', roleAccessSchema);


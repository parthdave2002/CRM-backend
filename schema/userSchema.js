const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  profile_pic: { type: String },
  date_of_birth: { type: Date },
  date_of_joining: { type: Date },
  password: { type: String },
  role: { type: schema.Types.ObjectId, required: true, ref: 'roles' },
  is_active: { type: Boolean, required: true, default: false },
  updated_at: { type: Date },
  added_at: { type: Date, default: Date.now},
  added_by: { type: schema.Types.ObjectId, ref: 'users' },
  is_deleted: { type: Boolean, default: false},
  deleted_by: { type: schema.Types.ObjectId},
  deleted_at: {type: Date},
});

module.exports = User = mongoose.model('users', userSchema);

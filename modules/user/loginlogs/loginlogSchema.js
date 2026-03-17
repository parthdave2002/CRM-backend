const mongoose = require('mongoose');
const schema = mongoose.Schema;
const moment = require('moment');

const loginLogSchema = new schema({
  login_date: { type: String, required: true,default: moment().format() },
  expires_in: { type: Date },
  logout_date: { type: String},
  ip_address: { type: String },
  device_info: { type: String },
  browser_info: { type: String },
  is_active: { type: Boolean, required: true, default: true },
  token: { type: String, required: true },
  user_id: { type: schema.Types.ObjectId, required: true, ref: 'users' },
  Login_duration: { type: String }
});

module.exports = loginlogs = mongoose.model('loginlogs', loginLogSchema);

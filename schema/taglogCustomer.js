const mongoose = require('mongoose');
const schema = mongoose.Schema;

const taglogCustomerSchema = new schema({
  customer_id: { type: schema.Types.ObjectId, ref: 'customers', required: true },
  taglog_id: { type: schema.Types.ObjectId, ref: 'taglog', required: true },
  subtaglog_id: { type: schema.Types.ObjectId, ref: 'taglog', required: true },
  is_active: { type:  Boolean, default: true, required: true},
  comment: { type: String },
  created_by: { type: schema.Types.ObjectId, ref: 'users' },
  created_at: { type: Date, default: new Date() },
});

module.exports = TaglogCustomer = mongoose.model('taglogcustomer', taglogCustomerSchema)
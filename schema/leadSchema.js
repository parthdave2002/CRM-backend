const mongoose = require('mongoose');
const schema = mongoose.Schema;

const leadSchema = new schema({
  name : { type: String, required: true },
  mobile_number : { type: Number },
  purpose : { type: String },
  description : { type: String },
  taglog : { type: String },
  order_id : { type: String, ref: 'orders' },
  Comments : { type: String },
  is_active : { type: Boolean, default: true },
  added_from :{ type: String , enum: ['contactus', 'help', 'order'] },
  added_at : { type: Date, default: Date.now },
  is_deleted : { type:Boolean, default: false },
});

module.exports = leads = mongoose.model('leads', leadSchema);

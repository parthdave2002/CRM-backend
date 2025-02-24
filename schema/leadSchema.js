const mongoose = require('mongoose');
const schema = mongoose.Schema;

const leadSchema = new schema({
  name : { type: String, required: true },
  mobile_number : { type: Number },
  purpose : { type: String },
  description : { type: String },
  taglog : { type: String },
  order_id : { type: schema.Types.ObjectId, ref: 'orders' },
  Comments : { type: String },
  is_active : { type: Boolean, default: true },
  added_from :{ type: String },
  added_at : { type: Date, default: Date.now },
});

module.exports = leads = mongoose.model('leads', leadSchema);

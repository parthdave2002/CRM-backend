const mongoose = require('mongoose');
const schema = mongoose.Schema;

const leadSchema = new schema({
  name: { type: String, required: true },
  mobile_number: { type: Number },
  email: { type: String },
  comment: { type: String },
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  user_type: { type: String, enum: ['farmer', 'job_application', 'dealer'] },
  type: { type: String, required: true, enum: ['contactus', 'help', 'order'] },
  status: { type: String, default: 'pending', required: false, enum: ['pending', 'completed'] },
  added_at: { type: Date, default: Date.now },
});

module.exports = leads = mongoose.model('leads', leadSchema);
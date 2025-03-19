const mongoose = require('mongoose');
const schema = mongoose.Schema;

const complainSchema = new schema({
  complain_id: { type: String },
  created_by: { type: schema.Types.ObjectId, ref: 'users' },
  product: { type: String },
  order: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low'] },
  date: { type: Date, default: Date.now },
  Comment: [
    {
        name: { type: schema.Types.ObjectId, ref: 'users'  },
        comment: { type: String, required: true },
        comment_date: { type: String, required: true },
    }
  ],
  resolution : { type: String ,enum: ['open', 'close'] }
});


module.exports = complain = mongoose.model('complain', complainSchema);

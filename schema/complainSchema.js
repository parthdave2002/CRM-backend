const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complainSchema = new Schema({
  complain_id: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: 'users' },
  created_at: { type: Date, default: Date.now },
  product_id: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }], 
  order_id: {  type: String, required: true  },      
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true }, 
  title: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'] },
  date: { type: Date, default: Date.now },
  Comment: [
    {
      name: { type: Schema.Types.ObjectId, ref: 'users' },
      comment: { type: String, required: true },
      comment_date: { type: Date, required: true },
    }
  ],
  resolution: { type: String, enum: ['open', 'close'], default: 'open' },
});

module.exports = mongoose.model('complain', complainSchema);

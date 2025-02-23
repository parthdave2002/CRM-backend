const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {  type: mongoose.Schema.Types.ObjectId,  required: true,  ref: 'user',  },
  token: { type: String,   required: true, },
  added_at: {  type: Date,  required: true,  default: Date.now, },
});

module.exports = Token = mongoose.model('Token', tokenSchema);

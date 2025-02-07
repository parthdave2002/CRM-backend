const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packingSchema = new Schema({
    number: { type: Number,  required: true, },
    is_active: { type: Boolean, required: true,  default: true,},
    createdAt: { type: Date,  default: Date.now },
});

module.exports = Packaging = mongoose.model('packaging', packingSchema);
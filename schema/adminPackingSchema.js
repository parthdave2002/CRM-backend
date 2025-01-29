const mongoose = require('mongoose');

const packingSchema = new mongoose.Schema({
    number: { type: Number,  required: true, },
    type: { type: mongoose.Schema.Types.ObjectId,  required: true, ref: 'packing-type'},
    is_active: { type: Boolean, required: true,  default: true,},
    createdAt: { type: Date,  default: Date.now },
});

const Packaging = mongoose.model('packaging', packingSchema);
module.exports = Packaging;
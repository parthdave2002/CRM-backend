const mongoose = require('mongoose');

const packingTypeSchema = new mongoose.Schema({
    type: {  type: String,  required: true },
    is_active: { type: Boolean, required: true,  default: true,},
    createdAt: { type: Date,  default: Date.now },
});

const Packaging = mongoose.model('packing-type', packingTypeSchema);
module.exports = Packaging;
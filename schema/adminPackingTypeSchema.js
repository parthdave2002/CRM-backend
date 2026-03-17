const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packingTypeSchema = new Schema({
    type_eng: {  type: String,  required: true },
    type_guj: {  type: String,  required: true },
    is_active: { type: Boolean, required: true,  default: true,},
    added_at: { type: Date,  default: Date.now },
    is_deleted:{ type: Boolean, default: false},
    updated_at: { type: Date,  default: Date.now},
});

module.exports = PackagingType = mongoose.model('packing-type', packingTypeSchema);
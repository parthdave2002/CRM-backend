const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const villageSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        taluka: { type: Schema.Types.ObjectId, ref: 'Taluka', required: true },
        pincode: { type: Number, required: false },
    }
);

module.exports = mongoose.model('Village', villageSchema);
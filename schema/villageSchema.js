const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const villageSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String, required: true, trim: true },
        taluka: { type: Schema.Types.ObjectId, ref: 'Taluka', required: true },
    }
);

module.exports = mongoose.model('Village', villageSchema);
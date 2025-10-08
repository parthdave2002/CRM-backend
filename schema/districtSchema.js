const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const districtSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId }, // allow using existing IDs
        name: { type: String, required: true, trim: true },
        state: { type: Schema.Types.ObjectId, ref: 'State', required: true },
    },
);

module.exports = mongoose.model('District', districtSchema);
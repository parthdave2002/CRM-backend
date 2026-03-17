const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const talukaSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        district: { type: Schema.Types.ObjectId, ref: 'District', required: true },
    }
);

module.exports = mongoose.model('Taluka', talukaSchema);
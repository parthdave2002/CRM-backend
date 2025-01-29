const mongoose = require('mongoose');
const schema = mongoose.Schema;

const companySchema = new schema({
    name: { type: String,  required: true, unique: true },
    description: { type: String,  required: true, },
    is_active: { type: Boolean, required: true,  default: true,},
    createdAt: { type: Date,  default: Date.now},
    is_deleted: { type: Boolean, default: false },
    added_by: { type: schema.Types.ObjectId, ref: 'users' },
});

module.exports = Company = mongoose.model('company', companySchema);
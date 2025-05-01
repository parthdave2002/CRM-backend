const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productcategorySchema = new schema({
    name_eng: { type: String,  required: true },
    name_guj: { type: String,  required: true },
    description: { type: String,  required: true, },
    category_pic :{ type: String, required: true,},
    is_active: { type: Boolean, required: true },
    added_at: { type: Date,  default: Date.now},
    updated_at: { type: Date,  default: Date.now},
    is_deleted: { type: Boolean, default: false },
});

module.exports = Category = mongoose.model('categories', productcategorySchema);
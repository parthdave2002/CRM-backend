const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productcategorySchema = new schema({
    name: { type: String,  required: true, unique: true },
    description: { type: String,  required: true, },
    category_pic :{ type: String, required: true,},
    is_active: { type: Boolean, required: true,  default: true,},
    added_at: { type: Date,  default: Date.now},
    is_deleted: { type: Boolean, default: false },
});

module.exports = Category = mongoose.model('categories', productcategorySchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerTypeSchema = new Schema({
    name: {  type: String,  required: true },
    description : {  type: String,  required: true },
    banner_pic: {  type: String, required: true },
    is_active: { type: Boolean, required: true,  default: true},
    createdAt: { type: Date,  default: Date.now },
});

module.exports = Banner = mongoose.model('banner', bannerTypeSchema);
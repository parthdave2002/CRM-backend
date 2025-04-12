const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema({
  name: String
}, { _id: true });

const TalukaSchema = new mongoose.Schema({
  name: String,
  villages: [VillageSchema]
}, { _id: true });

const DistrictSchema = new mongoose.Schema({
  name: String,
  talukas: [TalukaSchema]
}, { _id: true });

const StateSchema = new mongoose.Schema({
  name: String,
  districts: [DistrictSchema]
});

module.exports = mongoose.model('State', StateSchema);

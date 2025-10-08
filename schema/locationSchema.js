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

// Register sub-models so they are available when other modules call populate by model name.
// Use guards to avoid OverwriteModelError if they're registered elsewhere.
if (!mongoose.models.Village) {
  mongoose.model('Village', VillageSchema);
}
if (!mongoose.models.Taluka) {
  mongoose.model('Taluka', TalukaSchema);
}
if (!mongoose.models.District) {
  mongoose.model('District', DistrictSchema);
}

module.exports = mongoose.model('State', StateSchema);

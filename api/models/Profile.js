const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  photo: [String],
  name: { type: String, required: true },
  phone: { type: String, required: true },  // Ensure consistency
  email: { type: String, required: true },
});

const ProfileModel = mongoose.model('Profile', profileSchema);
module.exports = ProfileModel;

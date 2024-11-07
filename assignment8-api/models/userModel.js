const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  imagePath: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  verificationToken: { type: String, required: false },
  verificationTokenExpiry: { type: Date, required: false },
  isVerified: { type: Boolean, default: false },
  isEmailSent: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

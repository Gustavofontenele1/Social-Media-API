const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  verificationToken: { type: String, required: true },
  verificationTokenExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  isEmailSent: { type: Boolean, default: false },
});

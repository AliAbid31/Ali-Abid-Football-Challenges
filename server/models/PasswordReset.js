const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('PasswordReset', passwordResetSchema);
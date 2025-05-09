const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  goalsScore: { type: Number, default: 0 },
  assistsScore: { type: Number, default: 0 },
  trophiesScore: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'footballchallenges' // <--- AJOUTEZ CETTE LIGNE
});

// ... (le reste du fichier reste identique : pre 'save', comparePassword)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema); // Le nom du modèle reste 'User'

module.exports = User;
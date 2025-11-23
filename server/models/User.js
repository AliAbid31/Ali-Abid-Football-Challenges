const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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
  email: {
    type: String,
    required: [true, 'Email is required'], 
    unique: true,
    match: [/.+\@.+\..+/, 'Veuillez entrer une adresse email valide']
  },
  goalsScore: { type: Number, default: 0 },
  assistsScore: { type: Number, default: 0 },
  trophiesScore: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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

const User = mongoose.model('User', userSchema); 

module.exports = User;
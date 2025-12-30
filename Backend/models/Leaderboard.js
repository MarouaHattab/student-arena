const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Le projet est requis']
  },
  position: {
    type: Number,
    min: [1, 'La position minimum est 1'],
    required: [true, 'La position est requise']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  wins: {
    type: Number,
    default: 0,
    min: [0, 'Les victoires ne peuvent pas être négatives']
  },
  secondPlace: {
    type: Number,
    default: 0,
    min: [0, 'Les 2èmes places ne peuvent pas être négatives']
  },
  thirdPlace: {
    type: Number,
    default: 0,
    min: [0, 'Les 3èmes places ne peuvent pas être négatives']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

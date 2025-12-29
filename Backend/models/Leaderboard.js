const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  position: {
    type: Number,
    min: 1
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
    min: 0
  },
  wins: {
    type: Number,
    default: 0,
    min: 0
  },
  secondPlace: {
    type: Number,
    default: 0,
    min: 0
  },
  thirdPlace: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: Date,
  createdAt: Date
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

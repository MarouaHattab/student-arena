const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: String,
  description: String,
  slogan: String,
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  invitationCode: String,
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }
  ],
  registeredProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  maxMembers: {
    type: Number,
    default: 5,
    min: 2,
    max: 5
  },
  minMembers: {
    type: Number,
    default: 2,
    min: 2
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: Date,
  updatedAt: Date
});

const team = mongoose.model('Team', teamSchema);

module.exports = team;
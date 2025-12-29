const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  userName: String,
  bio: String,
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  points: {
    type: Number,
    default: 0,
    min: 0
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isTeamLeader: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  updatedAt: Date
});

const user = mongoose.model('User', userSchema);
module.exports = user;
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  submittedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedByTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  githubLink: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
});

const submission = mongoose.model('Submission', submissionSchema);

module.exports = submission;
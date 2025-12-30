const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Le projet est requis']
  },
  submittedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedByTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  githubLink: {
    type: String,
    required: [true, 'Le lien GitHub est requis'],
    trim: true,
    match: [/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/, 'Le lien doit être un URL GitHub valide (https://github.com/user/repo)']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Le statut doit être "pending", "approved" ou "rejected"'
    },
    default: 'pending'
  },
  score: {
    type: Number,
    min: [0, 'Le score minimum est 0'],
    max: [100, 'Le score maximum est 100']
  },
  ranking: {
    type: Number,
    min: [1, 'Le classement minimum est 1']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Le feedback ne peut pas dépasser 2000 caractères']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
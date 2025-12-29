const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  successCriteria: String,
  tags: [String],
  type: {
    type: String,
    enum: ['individual', 'team']
  },
  startDate: Date,
  endDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participantType'
    }
  ],
  participantType: {
    type: String,
    enum: ['User', 'Team']
  },
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }
  ],
  firstPlacePoints: {
    type: Number,
    default: 100,
    min: 0
  },
  secondPlacePoints: {
    type: Number,
    default: 75,
    min: 0
  },
  thirdPlacePoints: {
    type: Number,
    default: 50,
    min: 0
  },
  otherParticipantsPoints: {
    type: Number,
    default: 25,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const project = mongoose.model('Project', projectSchema);

module.exports = project;
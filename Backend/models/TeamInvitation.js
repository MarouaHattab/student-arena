const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: String,
  respondedAt: Date,
  expiresAt: Date,
  createdAt: Date
});

const teamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
module.exports = teamInvitation;
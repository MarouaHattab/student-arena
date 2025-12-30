const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe est requise']
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur invité est requis']
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'inviteur est requis']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected', 'cancelled'],
      message: 'Le statut doit être "pending", "accepted", "rejected" ou "cancelled"'
    },
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
  },
  respondedAt: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours par défaut
    }
  }
}, {
  timestamps: true
});

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
module.exports = TeamInvitation;
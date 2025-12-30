const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'équipe est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  slogan: {
    type: String,
    trim: true,
    maxlength: [200, 'Le slogan ne peut pas dépasser 200 caractères']
  },
  leaders: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 2;
      },
      message: 'Une équipe doit avoir entre 1 et 2 leaders'
    }
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  invitationCode: {
    type: String,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  rating: {
    type: Number,
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5']
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
    min: [2, 'Le minimum de membres est 2'],
    max: [5, 'Le maximum de membres est 5']
  },
  minMembers: {
    type: Number,
    default: 2,
    min: [2, 'Le minimum de membres est 2']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'archived'],
      message: 'Le statut doit être "active", "inactive" ou "archived"'
    },
    default: 'active'
  }
}, {
  timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
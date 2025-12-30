const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },
  successCriteria: {
    type: String,
    trim: true,
    maxlength: [2000, 'Les critères de succès ne peuvent pas dépasser 2000 caractères']
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Maximum 10 tags autorisés'
    }
  },
  type: {
    type: String,
    required: [true, 'Le type est requis'],
    enum: {
      values: ['individual', 'team'],
      message: 'Le type doit être "individual" ou "team"'
    }
  },
  startDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !this.endDate || v < this.endDate;
      },
      message: 'La date de début doit être avant la date de fin'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !this.startDate || v > this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le créateur est requis']
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participantType'
    }
  ],
  participantType: {
    type: String,
    enum: {
      values: ['User', 'Team'],
      message: 'Le type de participant doit être "User" ou "Team"'
    }
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
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  secondPlacePoints: {
    type: Number,
    default: 75,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  thirdPlacePoints: {
    type: Number,
    default: 50,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  otherParticipantsPoints: {
    type: Number,
    default: 25,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'completed', 'archived'],
      message: 'Le statut doit être "draft", "active", "completed" ou "archived"'
    },
    default: 'draft'
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
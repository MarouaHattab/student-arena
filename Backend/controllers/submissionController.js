const Submission = require('../models/Submission');
const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Créer une soumission
// @route   POST /api/submissions
// @access  Private
const createSubmission = async (req, res) => {
  try {
    const { projectId, githubLink } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier si le projet est actif
    if (project.status !== 'active') {
      return res.status(400).json({ message: 'Ce projet n\'accepte plus de soumissions' });
    }

    // Vérifier la date limite
    if (new Date() > new Date(project.endDate)) {
      return res.status(400).json({ message: 'La date limite de soumission est passée' });
    }

    let submissionData = {
      project: projectId,
      githubLink,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Vérifier si projet individuel ou équipe
    if (project.type === 'individual') {
      // Vérifier si l'utilisateur est inscrit
      if (!project.participants.includes(req.user._id)) {
        return res.status(400).json({ message: 'Vous n\'êtes pas inscrit à ce projet' });
      }

      // Vérifier si l'utilisateur a déjà soumis
      const existingSubmission = await Submission.findOne({
        project: projectId,
        submittedByUser: req.user._id
      });

      if (existingSubmission) {
        return res.status(400).json({ message: 'Vous avez déjà soumis une solution pour ce projet' });
      }

      submissionData.submittedByUser = req.user._id;
    } else {
      // Projet par équipe
      if (!req.user.team) {
        return res.status(400).json({ message: 'Vous devez faire partie d\'une équipe' });
      }

      // Vérifier si l'équipe est inscrite
      if (!project.participants.includes(req.user.team)) {
        return res.status(400).json({ message: 'Votre équipe n\'est pas inscrite à ce projet' });
      }

      // Vérifier si l'équipe a déjà soumis
      const existingSubmission = await Submission.findOne({
        project: projectId,
        submittedByTeam: req.user.team
      });

      if (existingSubmission) {
        return res.status(400).json({ message: 'Votre équipe a déjà soumis une solution pour ce projet' });
      }

      submissionData.submittedByTeam = req.user.team;
    }

    const submission = await Submission.create(submissionData);

    // Ajouter la soumission au projet
    project.submissions.push(submission._id);
    await project.save();

    // Ajouter la soumission à l'utilisateur ou l'équipe
    if (project.type === 'individual') {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { submissions: submission._id }
      });
    } else {
      await Team.findByIdAndUpdate(req.user.team, {
        $push: { submissions: submission._id }
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer toutes les soumissions
// @route   GET /api/submissions
// @access  Private/Admin
const getSubmissions = async (req, res) => {
  try {
    const { projectId, status } = req.query;

    let query = {};
    if (projectId) query.project = projectId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('project', 'title')
      .populate('submittedByUser', 'firstName lastName userName')
      .populate('submittedByTeam', 'name')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer une soumission par ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('project', 'title description')
      .populate('submittedByUser', 'firstName lastName userName')
      .populate('submittedByTeam', 'name members')
      .populate('reviewedBy', 'firstName lastName');

    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    // Admin peut tout voir
    if (req.user.role === 'admin') {
      return res.json(submission);
    }

    // Vérifier si c'est une soumission individuelle de l'utilisateur
    if (submission.submittedByUser && 
        submission.submittedByUser._id.toString() === req.user._id.toString()) {
      return res.json(submission);
    }

    // Vérifier si c'est une soumission d'équipe et l'utilisateur est membre
    if (submission.submittedByTeam) {
      const isMember = submission.submittedByTeam.members.some(
        m => m.toString() === req.user._id.toString()
      );
      if (isMember) {
        return res.json(submission);
      }
    }

    return res.status(403).json({ message: 'Non autorisé à voir cette soumission' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour une soumission (avant évaluation)
// @route   PUT /api/submissions/:id
// @access  Private
const updateSubmission = async (req, res) => {
  try {
    const { githubLink } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    // Vérifier si la soumission n'a pas encore été évaluée
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Cette soumission a déjà été évaluée' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    const isOwner = submission.submittedByUser?.toString() === req.user._id.toString() ||
                    submission.submittedByTeam?.toString() === req.user.team?.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    submission.githubLink = githubLink;
    submission.updatedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer une soumission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Soumission supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Évaluer une soumission (Admin)
// @route   POST /api/submissions/:id/review
// @access  Private/Admin
const reviewSubmission = async (req, res) => {
  try {
    const { status, score, feedback } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    submission.status = status;
    submission.score = score;
    submission.feedback = feedback;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.updatedAt = new Date();

    await submission.save();

    res.json({ message: 'Soumission évaluée avec succès', submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Attribuer un classement et des points
// @route   POST /api/submissions/:id/rank
// @access  Private/Admin
const rankSubmission = async (req, res) => {
  try {
    const { ranking } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('project');
    
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    if (submission.status !== 'approved') {
      return res.status(400).json({ message: 'La soumission doit être approuvée avant d\'être classée' });
    }

    const project = submission.project;
    let pointsAwarded = project.otherParticipantsPoints;

    if (ranking === 1) {
      pointsAwarded = project.firstPlacePoints;
    } else if (ranking === 2) {
      pointsAwarded = project.secondPlacePoints;
    } else if (ranking === 3) {
      pointsAwarded = project.thirdPlacePoints;
    }

    // Mettre à jour les points de l'utilisateur ou de l'équipe
    if (submission.submittedByUser) {
      await User.findByIdAndUpdate(submission.submittedByUser, {
        $inc: { points: pointsAwarded }
      });
    } else if (submission.submittedByTeam) {
      await Team.findByIdAndUpdate(submission.submittedByTeam, {
        $inc: { points: pointsAwarded }
      });
    }

    // Mettre à jour la soumission - utiliser project._id car project est maintenant peuplé
    await Submission.findByIdAndUpdate(req.params.id, {
      ranking,
      pointsAwarded,
      updatedAt: new Date()
    });

    res.json({ message: 'Classement attribué avec succès', ranking, pointsAwarded });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer mes soumissions
// @route   GET /api/submissions/my
// @access  Private
const getMySubmissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.team) {
      query = {
        $or: [
          { submittedByUser: req.user._id },
          { submittedByTeam: req.user.team }
        ]
      };
    } else {
      query = { submittedByUser: req.user._id };
    }

    const submissions = await Submission.find(query)
      .populate('project', 'title status')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les soumissions d'une équipe
// @route   GET /api/submissions/team/:teamId
// @access  Private (membre de l'équipe ou admin)
const getTeamSubmissions = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Trouver l'équipe
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est membre de l'équipe ou admin
    const isMember = team.members.some(m => m.toString() === req.user._id.toString());
    
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à voir les soumissions de cette équipe' });
    }

    const submissions = await Submission.find({ submittedByTeam: teamId })
      .populate('project', 'title status type')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  reviewSubmission,
  rankSubmission,
  getMySubmissions,
  getTeamSubmissions
};

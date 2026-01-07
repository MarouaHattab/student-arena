const Submission = require('../models/Submission');
const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');

// Create submission
// POST /api/submissions
// Private
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

      // Vérifier si l'équipe existe vraiment
      const team = await Team.findById(req.user.team);
      if (!team) {
        // Nettoyer la référence orpheline
        await User.findByIdAndUpdate(req.user._id, {
          $unset: { team: 1 },
          isTeamLeader: false
        });
        return res.status(404).json({ message: 'Équipe non trouvée. Votre référence d\'équipe a été nettoyée.' });
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

// Get all submissions
// GET /api/submissions
// Private/Admin
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

// Get submission by ID
// GET /api/submissions/:id
// Private
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

// Update submission (before evaluation)
// PUT /api/submissions/:id
// Private
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

// Delete submission
// DELETE /api/submissions/:id
// Private/Admin
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

// Evaluate submission (Admin)
// POST /api/submissions/:id/review
// Private/Admin
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

// Assign ranking and points
// POST /api/submissions/:id/rank
// Private/Admin
const rankSubmission = async (req, res) => {
  try {
    const { ranking } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate('project')
      .populate('submittedByUser')
      .populate({
        path: 'submittedByTeam',
        populate: { path: 'members' }
      });
    
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    if (submission.status !== 'approved') {
      return res.status(400).json({ message: 'La soumission doit être approuvée avant d\'être classée' });
    }

    const project = submission.project;
    let pointsAwarded = project.otherParticipantsPoints;

    // Déterminer les points selon le classement (1er, 2ème, 3ème)
    if (ranking === 1) {
      pointsAwarded = project.firstPlacePoints;
    } else if (ranking === 2) {
      pointsAwarded = project.secondPlacePoints;
    } else if (ranking === 3) {
      pointsAwarded = project.thirdPlacePoints;
    }

    let pointsDistribution = {
      mainRecipient: { type: '', name: '', points: 0 },
      bonus: []
    };

    // PROJET INDIVIDUEL
    if (submission.submittedByUser) {
      const user = submission.submittedByUser;
      
      // Ajouter 100% des points à l'utilisateur
      await User.findByIdAndUpdate(user._id, {
        $inc: { points: pointsAwarded }
      });

      pointsDistribution.mainRecipient = {
        type: 'user',
        name: `${user.firstName} ${user.lastName}`,
        points: pointsAwarded
      };

      // Si l'utilisateur fait partie d'une équipe, ajouter 50% des points à l'équipe
      if (user.team) {
        const teamBonus = Math.round(pointsAwarded * 0.5);
        await Team.findByIdAndUpdate(user.team, {
          $inc: { points: teamBonus }
        });

        const team = await Team.findById(user.team);
        pointsDistribution.bonus.push({
          type: 'team',
          name: team.name,
          points: teamBonus,
          reason: '50% bonus pour l\'équipe (projet individuel)'
        });
      }
    } 
    // PROJET D'ÉQUIPE
    else if (submission.submittedByTeam) {
      const team = submission.submittedByTeam;
      
      // Ajouter 100% des points à l'équipe
      await Team.findByIdAndUpdate(team._id, {
        $inc: { points: pointsAwarded }
      });

      pointsDistribution.mainRecipient = {
        type: 'team',
        name: team.name,
        points: pointsAwarded
      };

      // Ajouter 50% des points à chaque membre de l'équipe
      const memberBonus = Math.round(pointsAwarded * 0.5);
      
      for (const member of team.members) {
        await User.findByIdAndUpdate(member._id, {
          $inc: { points: memberBonus }
        });

        pointsDistribution.bonus.push({
          type: 'user',
          name: `${member.firstName} ${member.lastName}`,
          points: memberBonus,
          reason: '50% bonus pour chaque membre (projet d\'équipe)'
        });
      }
    }

    // Mettre à jour la soumission
    await Submission.findByIdAndUpdate(req.params.id, {
      ranking,
      pointsAwarded,
      updatedAt: new Date()
    });

    res.json({ 
      message: 'Classement attribué avec succès', 
      ranking, 
      pointsAwarded,
      distribution: pointsDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get my submissions
// GET /api/submissions/my
// Private
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

// Get team submissions
// GET /api/submissions/team/:teamId
// Private (team member or admin)
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

// Add points to a user or team
// POST /api/submissions/add-points
// Private/Admin
const addPoints = async (req, res) => {
  try {
    const { userId, teamId, points, reason } = req.body;

    // Validation
    if (!points || points === 0) {
      return res.status(400).json({ message: 'Le nombre de points ne peut pas être 0' });
    }

    if (!userId && !teamId) {
      return res.status(400).json({ message: 'Vous devez spécifier un utilisateur ou une équipe' });
    }

    if (userId && teamId) {
      return res.status(400).json({ message: 'Vous ne pouvez spécifier qu\'un utilisateur OU une équipe, pas les deux' });
    }

    let result;

    if (userId) {
      // Ajouter des points à un utilisateur
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      user.points = (user.points || 0) + points;
      await user.save();

      result = {
        type: 'user',
        target: `${user.firstName} ${user.lastName}`,
        previousPoints: (user.points - points),
        newPoints: user.points,
        pointsAdded: points,
        reason: reason || 'Attribution manuelle par admin'
      };
    } else {
      // Ajouter des points à une équipe
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }

      team.points = (team.points || 0) + points;
      await team.save();

      result = {
        type: 'team',
        target: team.name,
        previousPoints: (team.points - points),
        newPoints: team.points,
        pointsAdded: points,
        reason: reason || 'Attribution manuelle par admin'
      };
    }

    res.json({ 
      message: 'Points ajoutés avec succès',
      result
    });
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
  getTeamSubmissions,
  addPoints
};

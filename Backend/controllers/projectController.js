const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Créer un projet
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      successCriteria,
      tags,
      type,
      startDate,
      endDate,
      firstPlacePoints,
      secondPlacePoints,
      thirdPlacePoints,
      otherParticipantsPoints
    } = req.body;

    const project = await Project.create({
      title,
      description,
      successCriteria,
      tags,
      type,
      startDate,
      endDate,
      createdBy: req.user._id,
      firstPlacePoints: firstPlacePoints || 100,
      secondPlacePoints: secondPlacePoints || 75,
      thirdPlacePoints: thirdPlacePoints || 50,
      otherParticipantsPoints: otherParticipantsPoints || 25,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer tous les projets
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = { isVisible: true };
    if (status) query.status = status;
    if (type) query.type = type;

    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer un projet par ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('submissions')
      .populate('participants');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour un projet
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Seul le créateur ou admin peut modifier
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un projet
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    S'inscrire à un projet (individuel ou équipe)
// @route   POST /api/projects/:id/register
// @access  Private
const registerToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Vérifier si le projet est ouvert aux inscriptions
    if (project.status !== 'active') {
      return res.status(400).json({ message: 'Ce projet n\'est pas ouvert aux inscriptions' });
    }

    // Vérifier la date limite
    if (new Date() > new Date(project.endDate)) {
      return res.status(400).json({ message: 'La date limite d\'inscription est passée' });
    }

    // Vérifier le type de projet
    if (project.type === 'individual') {
      // Pour un projet individuel - un seul membre par équipe peut s'inscrire
      // Vérifier si l'utilisateur est déjà inscrit
      if (project.participants.includes(req.user._id)) {
        return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce projet' });
      }

      // Vérifier si un autre membre de son équipe a déjà choisi ce projet
      if (req.user.team) {
        const team = await Team.findById(req.user.team).populate('members');
        if (team) {
          const teamMemberIds = team.members.map(member => member._id.toString());
          const otherMembersWithProject = await User.find({
            _id: { $in: teamMemberIds, $ne: req.user._id },
            registeredProjects: project._id
          });

          if (otherMembersWithProject.length > 0) {
            const memberNames = otherMembersWithProject.map(m => `${m.firstName} ${m.lastName}`).join(', ');
            const memberText = otherMembersWithProject.length === 1 ? 'Le membre' : 'Les membres';
            const verbText = otherMembersWithProject.length === 1 ? 'a déjà choisi' : 'ont déjà choisi';
            return res.status(400).json({ 
              message: `${memberText} ${memberNames} de votre équipe ${verbText} ce projet. Un seul membre par équipe peut participer à un projet individuel.` 
            });
          }
        }
      }

      project.participants.push(req.user._id);
      project.participantType = 'User';

      // Ajouter le projet aux projets enregistrés de l'utilisateur
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { registeredProjects: project._id }
      });
    } else {
      // Pour un projet par équipe
      if (!req.user.team) {
        return res.status(400).json({ message: 'Vous devez faire partie d\'une équipe pour vous inscrire à ce projet en équipe' });
      }

      // Récupérer l'équipe avec tous ses membres
      const team = await Team.findById(req.user.team).populate('members');
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }

      // Vérifier si l'utilisateur est un leader
      const isLeader = team.leaders.some(leaderId => leaderId.toString() === req.user._id.toString());
      if (!isLeader) {
        return res.status(403).json({ message: 'Seul un leader peut inscrire l\'équipe à ce projet' });
      }

      // Vérifier si l'équipe a le minimum de membres
      if (team.members.length < team.minMembers) {
        return res.status(400).json({ message: `L'équipe doit avoir au moins ${team.minMembers} membres` });
      }

      // Vérifier si l'équipe est déjà inscrite à ce projet
      if (project.participants.includes(req.user.team)) {
        return res.status(400).json({ message: 'Votre équipe est déjà inscrite à ce projet' });
      }

      // Vérifier si un membre de l'équipe n'a pas déjà choisi ce projet individuellement
      const teamMemberIds = team.members.map(member => member._id.toString());
      const membersWithProject = await User.find({
        _id: { $in: teamMemberIds },
        registeredProjects: project._id
      });

      if (membersWithProject.length > 0) {
        const memberNames = membersWithProject.map(m => `${m.firstName} ${m.lastName}`).join(', ');
        const memberText = membersWithProject.length === 1 ? 'le membre' : 'les membres';
        const verbText = membersWithProject.length === 1 ? 'a déjà choisi' : 'ont déjà choisi';
        return res.status(400).json({ 
          message: `Impossible d'inscrire l'équipe : ${memberText} ${memberNames} ${verbText} ce projet individuellement` 
        });
      }

      project.participants.push(req.user.team);
      project.participantType = 'Team';

      // Ajouter le projet aux projets enregistrés de l'équipe
      await Team.findByIdAndUpdate(req.user.team, {
        $addToSet: { registeredProjects: project._id }
      });
    }

    project.updatedAt = new Date();
    await project.save();

    res.json({ message: 'Inscription réussie', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Changer le statut du projet
// @route   PATCH /api/projects/:id/status
// @access  Private/Admin
const changeProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['draft', 'active', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les projets actifs
// @route   GET /api/projects/active
// @access  Public
const getActiveProjects = async (req, res) => {
  try {
    const now = new Date();
    const projects = await Project.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      isVisible: true
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ endDate: 1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les projets de l'utilisateur connecté
// @route   GET /api/projects/my-projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'registeredProjects',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      projects: user.registeredProjects,
      count: user.registeredProjects.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les projets de l'équipe de l'utilisateur
// @route   GET /api/projects/team-projects
// @access  Private
const getTeamProjects = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(400).json({ message: 'Vous ne faites partie d\'aucune équipe' });
    }

    const team = await Team.findById(req.user.team)
      .populate({
        path: 'registeredProjects',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName'
        }
      });

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json({
      teamName: team.name,
      projects: team.registeredProjects,
      count: team.registeredProjects.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les participants d'un projet (équipes et membres individuels)
// @route   GET /api/projects/:id/participants
// @access  Public
const getProjectParticipants = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    let participantsData = {
      projectTitle: project.title,
      projectType: project.type,
      totalParticipants: project.participants.length,
      teams: [],
      individuals: []
    };

    if (project.type === 'team') {
      // Récupérer les équipes participantes
      const teams = await Team.find({ _id: { $in: project.participants } })
        .populate('leaders', 'firstName lastName email')
        .populate('members', 'firstName lastName email')
        .select('name description slogan members leaders points');
      
      participantsData.teams = teams;
    } else if (project.type === 'individual') {
      // Récupérer les membres individuels participants
      const individuals = await User.find({ _id: { $in: project.participants } })
        .select('firstName lastName email userName points bio');
      
      participantsData.individuals = individuals;
    }

    res.json(participantsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  registerToProject,
  changeProjectStatus,
  getActiveProjects,
  getUserProjects,
  getTeamProjects,
  getProjectParticipants
};

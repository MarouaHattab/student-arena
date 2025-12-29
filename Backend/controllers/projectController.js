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

// @desc    S'inscrire à un projet (individuel)
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
      // Vérifier si l'utilisateur est déjà inscrit
      if (project.participants.includes(req.user._id)) {
        return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce projet' });
      }

      project.participants.push(req.user._id);
      project.participantType = 'User';

      // Ajouter le projet aux projets enregistrés de l'utilisateur
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { registeredProjects: project._id }
      });
    } else {
      // Projet par équipe
      if (!req.user.team) {
        return res.status(400).json({ message: 'Vous devez faire partie d\'une équipe pour vous inscrire' });
      }

      // Vérifier si l'utilisateur est le leader
      const team = await Team.findById(req.user.team);
      if (team.leader.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Seul le leader peut inscrire l\'équipe' });
      }

      // Vérifier si l'équipe a le minimum de membres
      if (team.members.length < team.minMembers) {
        return res.status(400).json({ message: `L'équipe doit avoir au moins ${team.minMembers} membres` });
      }

      // Vérifier si l'équipe est déjà inscrite
      if (project.participants.includes(req.user.team)) {
        return res.status(400).json({ message: 'Votre équipe est déjà inscrite à ce projet' });
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  registerToProject,
  changeProjectStatus,
  getActiveProjects
};

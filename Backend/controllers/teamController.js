const Team = require('../models/Team');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Créer une équipe
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const { name, description, slogan } = req.body;

    // Vérifier si l'utilisateur a déjà une équipe
    if (req.user.team) {
      return res.status(400).json({ message: 'Vous appartenez déjà à une équipe' });
    }

    // Vérifier si le nom d'équipe existe déjà
    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ message: 'Ce nom d\'équipe existe déjà' });
    }

    // Générer un code d'invitation unique
    const invitationCode = uuidv4().slice(0, 8).toUpperCase();

    // Créer l'équipe avec le créateur comme leader
    const team = await Team.create({
      name,
      description,
      slogan,
      leaders: [req.user._id],
      members: [req.user._id],
      invitationCode,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      isTeamLeader: true
    });

    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer toutes les équipes
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('leaders', 'firstName lastName userName')
      .populate('members', 'firstName lastName userName')
      .sort({ points: -1 });

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer une équipe par ID
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leaders', 'firstName lastName userName email')
      .populate('members', 'firstName lastName userName email points')
      .populate('submissions')
      .populate('registeredProjects', 'title');

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour une équipe
// @route   PUT /api/teams/:id
// @access  Private/TeamLeader
const updateTeam = async (req, res) => {
  try {
    const { name, description, slogan } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un leader peut modifier l\'équipe' });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (slogan) team.slogan = slogan;
    team.updatedAt = new Date();

    await team.save();

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer une équipe
// @route   DELETE /api/teams/:id
// @access  Private/TeamLeader/Admin
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader ou admin
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Retirer l'équipe de tous les membres
    await User.updateMany(
      { team: team._id },
      { $unset: { team: 1 }, isTeamLeader: false }
    );

    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Ajouter un membre à l'équipe (par email ou username)
// @route   POST /api/teams/:id/add-member
// @access  Private/TeamLeader
const addMember = async (req, res) => {
  try {
    const { emailOrUsername } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader) {
      return res.status(403).json({ message: 'Seul un leader peut ajouter des membres' });
    }

    // Vérifier si l'équipe est complète
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: `L'équipe est complète (maximum ${team.maxMembers} membres)` });
    }

    // Trouver l'utilisateur par email OU username
    const userToAdd = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { userName: emailOrUsername }
      ]
    });

    if (!userToAdd) {
      return res.status(404).json({ message: 'Utilisateur non trouvé avec cet email ou username' });
    }

    // Vérifier si l'utilisateur a déjà une équipe
    if (userToAdd.team) {
      return res.status(400).json({ message: 'Cet utilisateur appartient déjà à une équipe' });
    }

    // Vérifier si l'utilisateur est déjà membre
    if (team.members.some(m => m.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà membre de l\'équipe' });
    }

    // Ajouter directement l'utilisateur à l'équipe
    team.members.push(userToAdd._id);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(userToAdd._id, { team: team._id });

    res.status(201).json({ 
      message: `${userToAdd.firstName} ${userToAdd.lastName} a été ajouté à l'équipe`,
      team,
      addedMember: {
        _id: userToAdd._id,
        firstName: userToAdd.firstName,
        lastName: userToAdd.lastName,
        userName: userToAdd.userName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Rejoindre une équipe avec un code d'invitation
// @route   POST /api/teams/join
// @access  Private
const joinTeamByCode = async (req, res) => {
  try {
    const { invitationCode } = req.body;

    // Vérifier si l'utilisateur a déjà une équipe
    if (req.user.team) {
      return res.status(400).json({ message: 'Vous appartenez déjà à une équipe' });
    }

    const team = await Team.findOne({ invitationCode });
    if (!team) {
      return res.status(404).json({ message: 'Code d\'invitation invalide' });
    }

    // Vérifier si l'équipe est complète
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'L\'équipe est complète' });
    }

    // Ajouter l'utilisateur à l'équipe
    team.members.push(req.user._id);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user._id, { team: team._id });

    res.json({ message: 'Vous avez rejoint l\'équipe', team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Quitter une équipe
// @route   POST /api/teams/:id/leave
// @access  Private
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est membre
    if (!team.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Vous n\'êtes pas membre de cette équipe' });
    }

    // Vérifier si c'est le dernier leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (isLeader && team.leaders.length === 1) {
      return res.status(400).json({ message: 'Vous êtes le seul leader. Nommez un autre leader avant de quitter ou supprimez l\'équipe.' });
    }

    // Retirer l'utilisateur de l'équipe
    team.members = team.members.filter(m => m.toString() !== req.user._id.toString());
    
    // Retirer des leaders si c'était un leader
    if (isLeader) {
      team.leaders = team.leaders.filter(l => l.toString() !== req.user._id.toString());
    }
    
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user._id, { 
      $unset: { team: 1 },
      isTeamLeader: false
    });

    res.json({ message: 'Vous avez quitté l\'équipe' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Retirer un membre de l'équipe
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private/TeamLeader
const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader) {
      return res.status(403).json({ message: 'Seul un leader peut retirer des membres' });
    }

    const userIdToRemove = req.params.userId;

    // Vérifier si c'est le dernier leader
    const isTargetLeader = team.leaders.some(l => l.toString() === userIdToRemove);
    if (isTargetLeader && team.leaders.length === 1) {
      return res.status(400).json({ message: 'Impossible de retirer le dernier leader' });
    }

    // Vérifier si l'utilisateur est membre
    if (!team.members.some(m => m.toString() === userIdToRemove)) {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas membre de l\'équipe' });
    }

    // Retirer l'utilisateur des membres
    team.members = team.members.filter(m => m.toString() !== userIdToRemove);
    
    // Retirer des leaders si c'était un leader
    if (isTargetLeader) {
      team.leaders = team.leaders.filter(l => l.toString() !== userIdToRemove);
    }
    
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(userIdToRemove, { 
      $unset: { team: 1 },
      isTeamLeader: false
    });

    res.json({ message: 'Membre retiré avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Donner le leadership à un membre
// @route   POST /api/teams/:id/give-leadership/:userId
// @access  Private/TeamLeader
const giveLeadership = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader) {
      return res.status(403).json({ message: 'Seul un leader peut donner le leadership' });
    }

    const newLeaderId = req.params.userId;

    // Vérifier si l'utilisateur cible est membre de l'équipe
    if (!team.members.some(m => m.toString() === newLeaderId)) {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas membre de l\'équipe' });
    }

    // Vérifier si déjà leader
    if (team.leaders.some(l => l.toString() === newLeaderId)) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà leader' });
    }

    // Vérifier la limite de 2 leaders
    if (team.leaders.length >= 2) {
      return res.status(400).json({ message: 'L\'équipe a déjà 2 leaders (maximum)' });
    }

    // Ajouter le nouveau leader
    team.leaders.push(newLeaderId);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(newLeaderId, { isTeamLeader: true });

    res.json({ message: 'Leadership donné avec succès', team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Retirer le leadership d'un membre
// @route   DELETE /api/teams/:id/remove-leadership/:userId
// @access  Private/TeamLeader
const removeLeadership = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader) {
      return res.status(403).json({ message: 'Seul un leader peut retirer le leadership' });
    }

    const targetUserId = req.params.userId;

    // Vérifier qu'il reste au moins 1 leader
    if (team.leaders.length <= 1) {
      return res.status(400).json({ message: 'L\'équipe doit avoir au moins 1 leader' });
    }

    // Vérifier si l'utilisateur cible est leader
    if (!team.leaders.some(l => l.toString() === targetUserId)) {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas leader' });
    }

    // Retirer le leadership
    team.leaders = team.leaders.filter(l => l.toString() !== targetUserId);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(targetUserId, { isTeamLeader: false });

    res.json({ message: 'Leadership retiré avec succès', team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  joinTeamByCode,
  leaveTeam,
  removeMember,
  giveLeadership,
  removeLeadership
};

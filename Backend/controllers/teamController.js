const Team = require('../models/Team');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Create team
// POST /api/teams
// Private
const createTeam = async (req, res) => {
  try {
    const { name, description, slogan } = req.body;

    // Check if user already has a team (and if that team actually exists)
    if (req.user.team) {
      const existingTeam = await Team.findById(req.user.team);
      if (existingTeam) {
        return res.status(400).json({ message: 'Vous appartenez déjà à une équipe' });
      } else {
        // Nettoyer la référence orpheline (équipe supprimée mais référence restante)
        await User.findByIdAndUpdate(req.user._id, {
          $unset: { team: 1 },
          isTeamLeader: false
        });
      }
    }

    // Check if team name already exists
    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ message: 'Ce nom d\'équipe existe déjà' });
    }

    // Generate unique invitation code
    const invitationCode = uuidv4().slice(0, 8).toUpperCase();

    // Create team with creator as leader
    const team = await Team.create({
      name,
      description,
      slogan,
      leaders: [req.user._id],
      members: [req.user._id],
      invitationCode,
      registeredProjects: [], // Initialisation explicite
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update user
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

// Get all teams
// GET /api/teams
// Public
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('leaders', 'firstName lastName userName')
      .populate('members', 'firstName lastName userName')
      .populate('registeredProjects', 'title')
      .sort({ points: -1 });

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get team by ID
// GET /api/teams/:id
// Public
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

// Update team
// PUT /api/teams/:id
// Private/TeamLeader
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

// Delete team
// DELETE /api/teams/:id
// Private/TeamLeader/Admin
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

// Add member to team
// POST /api/teams/:id/add-member
// Private/TeamLeader
const addMember = async (req, res) => {
  try {
    const { emailOrUsername } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader ou admin
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un leader ou administrateur peut ajouter des membres' });
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

    // Vérifier si l'utilisateur est déjà membre de CETTE équipe
    const isAlreadyMember = team.members.some(m => m.toString() === userToAdd._id.toString());
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà membre de cette équipe' });
    }

    // Vérifier si l'utilisateur a déjà une autre équipe (et si cette équipe existe vraiment)
    if (userToAdd.team) {
      // Si l'utilisateur a une référence d'équipe, vérifier si c'est une équipe différente
      if (userToAdd.team.toString() !== team._id.toString()) {
        const existingTeam = await Team.findById(userToAdd.team);
        if (existingTeam) {
          return res.status(400).json({ message: 'Cet utilisateur appartient déjà à une autre équipe' });
        } else {
          // Nettoyer la référence orpheline (équipe supprimée mais référence restante)
          await User.findByIdAndUpdate(userToAdd._id, {
            $unset: { team: 1 },
            isTeamLeader: false
          });
        }
      }
      // Si userToAdd.team === team._id, c'est normal (peut arriver si la synchronisation n'est pas parfaite)
      // On continue car on a déjà vérifié qu'il n'est pas dans team.members
    }

    // Ajouter directement l'utilisateur à l'équipe
    team.members.push(userToAdd._id);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur : lui assigner l'équipe et synchroniser les projets de l'équipe
    await User.findByIdAndUpdate(userToAdd._id, { 
      team: team._id,
      $addToSet: { registeredProjects: { $each: team.registeredProjects || [] } }
    });

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

// Join team with invitation code
// POST /api/teams/join
// Private
const joinTeamByCode = async (req, res) => {
  try {
    const { invitationCode } = req.body;

    // Check if user already has a team (and if that team actually exists)
    if (req.user.team) {
      const existingTeam = await Team.findById(req.user.team);
      if (existingTeam) {
        return res.status(400).json({ message: 'Vous appartenez déjà à une équipe' });
      } else {
        // Nettoyer la référence orpheline (équipe supprimée mais référence restante)
        await User.findByIdAndUpdate(req.user._id, {
          $unset: { team: 1 },
          isTeamLeader: false
        });
      }
    }

    const team = await Team.findOne({ invitationCode });
    if (!team) {
      return res.status(404).json({ message: 'Code d\'invitation invalide' });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'L\'équipe est complète' });
    }

    // Add user to team
    team.members.push(req.user._id);
    team.updatedAt = new Date();
    await team.save();

    // Mettre à jour l'utilisateur : lui assigner l'équipe et synchroniser les projets de l'équipe
    await User.findByIdAndUpdate(req.user._id, { 
      team: team._id,
      $addToSet: { registeredProjects: { $each: team.registeredProjects || [] } }
    });

    res.json({ message: 'Vous avez rejoint l\'équipe', team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Leave team
// POST /api/teams/:id/leave
// Private
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Check if user is a member
    if (!team.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Vous n\'êtes pas membre de cette équipe' });
    }

    // Check if user is the last leader
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (isLeader && team.leaders.length === 1) {
      return res.status(400).json({ message: 'Vous êtes le seul leader. Nommez un autre leader avant de quitter ou supprimez l\'équipe.' });
    }

    // 1. Retirer l'utilisateur de l'équipe (atomique)
    await Team.findByIdAndUpdate(req.params.id, {
      $pull: { 
        members: req.user._id,
        leaders: req.user._id
      },
      updatedAt: new Date()
    });

    // 2. Mettre à jour l'utilisateur : supprimer l'équipe et les projets
    await User.findByIdAndUpdate(req.user._id, { 
      $unset: { team: 1, registeredProjects: 1 },
      isTeamLeader: false
    });

    res.json({ message: 'Vous avez quitté l\'équipe' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Remove member from team
// DELETE /api/teams/:id/members/:userId
// Private/TeamLeader
const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Vérifier si l'utilisateur est un leader ou admin
    const isLeader = team.leaders.some(l => l.toString() === req.user._id.toString());
    if (!isLeader && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un leader ou administrateur peut retirer des membres' });
    }

    const userIdToRemove = req.params.memberId;

    // Vérifier si le membre existe dans l'équipe
    const memberExists = team.members.some(m => m.toString() === userIdToRemove);
    if (!memberExists) {
      return res.status(404).json({ message: 'Ce membre n\'est pas dans cette équipe' });
    }

    // 1. Vérifier si c'est le dernier leader
    const isTargetLeader = team.leaders.some(l => l.toString() === userIdToRemove);
    if (isTargetLeader && team.leaders.length === 1) {
      return res.status(400).json({ message: 'Impossible de retirer le dernier leader. Nommez un autre leader avant.' });
    }

    // 2. Retirer l'utilisateur de l'équipe (atomique)
    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, {
      $pull: { 
        members: userIdToRemove,
        leaders: userIdToRemove
      },
      updatedAt: new Date()
    }, { new: true });

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Équipe non trouvée après mise à jour' });
    }

    // 3. Forcer le nettoyage du profil de l'utilisateur (sans condition sur l'equipe actuelle pour eviter les blocages)
    await User.findByIdAndUpdate(userIdToRemove, { 
      $unset: { team: 1, registeredProjects: 1 },
      isTeamLeader: false
    });

    // 4. Récupérer l'équipe mise à jour pour la réponse
    const finalTeam = await Team.findById(req.params.id)
      .populate('members', 'firstName lastName userName email')
      .populate('leaders', 'firstName lastName userName email');

    res.json({ 
      message: 'Membre retiré et profil nettoyé avec succès',
      team: finalTeam
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Give leadership to a member
// POST /api/teams/:id/give-leadership/:userId
// Private/TeamLeader
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

// Remove leadership from a member
// DELETE /api/teams/:id/remove-leadership/:userId
// Private/TeamLeader
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

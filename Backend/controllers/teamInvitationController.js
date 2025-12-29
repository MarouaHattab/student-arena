const TeamInvitation = require('../models/TeamInvitation');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Récupérer mes invitations reçues
// @route   GET /api/invitations/received
// @access  Private
const getMyReceivedInvitations = async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      invitedUser: req.user.id,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('team', 'name description')
      .populate('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer les invitations envoyées par mon équipe
// @route   GET /api/invitations/sent
// @access  Private/TeamLeader
const getMySentInvitations = async (req, res) => {
  try {
    // Trouver l'équipe dont l'utilisateur est leader
    const team = await Team.findOne({ leaders: req.user.id });
    if (!team) {
      return res.status(404).json({ message: 'Vous n\'êtes pas leader d\'une équipe' });
    }

    const invitations = await TeamInvitation.find({ team: team._id })
      .populate('invitedUser', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer une invitation par ID
// @route   GET /api/invitations/:id
// @access  Private
const getInvitationById = async (req, res) => {
  try {
    const invitation = await TeamInvitation.findById(req.params.id)
      .populate('team', 'name description')
      .populate('invitedUser', 'firstName lastName email')
      .populate('invitedBy', 'firstName lastName');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    // Vérifier que l'utilisateur est concerné par cette invitation
    const isInvitedUser = invitation.invitedUser._id.toString() === req.user.id;
    const isInviter = invitation.invitedBy._id.toString() === req.user.id;

    if (!isInvitedUser && !isInviter && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à voir cette invitation' });
    }

    res.json(invitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Répondre à une invitation (accepter/refuser)
// @route   PUT /api/invitations/:id/respond
// @access  Private
const respondToInvitation = async (req, res) => {
  try {
    const { response } = req.body; // 'accepted' ou 'rejected'

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Réponse invalide. Utilisez "accepted" ou "rejected"' });
    }

    const invitation = await TeamInvitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    // Vérifier que l'utilisateur est bien l'invité
    if (invitation.invitedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à répondre à cette invitation' });
    }

    // Vérifier que l'invitation est toujours en attente
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Cette invitation a déjà été traitée' });
    }

    // Vérifier que l'invitation n'est pas expirée
    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Cette invitation a expiré' });
    }

    // Mettre à jour le statut de l'invitation
    invitation.status = response;
    invitation.respondedAt = new Date();
    await invitation.save();

    // Si acceptée, ajouter l'utilisateur à l'équipe
    if (response === 'accepted') {
      const team = await Team.findById(invitation.team);

      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }

      // Vérifier la limite de membres
      if (team.members.length >= team.maxMembers) {
        invitation.status = 'rejected';
        await invitation.save();
        return res.status(400).json({ message: 'L\'équipe a atteint sa limite de membres' });
      }

      // Ajouter le membre à l'équipe
      team.members.push(req.user.id);
      await team.save();

      // Mettre à jour l'utilisateur
      await User.findByIdAndUpdate(req.user.id, { team: team._id });

      // Annuler toutes les autres invitations en attente pour cet utilisateur
      await TeamInvitation.updateMany(
        {
          invitedUser: req.user.id,
          status: 'pending',
          _id: { $ne: invitation._id }
        },
        { status: 'cancelled' }
      );
    }

    await invitation.populate([
      { path: 'team', select: 'name' },
      { path: 'invitedUser', select: 'firstName lastName' }
    ]);

    res.json({
      message: response === 'accepted' ? 'Invitation acceptée' : 'Invitation refusée',
      invitation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Annuler une invitation (par le leader)
// @route   DELETE /api/invitations/:id
// @access  Private/TeamLeader
const cancelInvitation = async (req, res) => {
  try {
    const invitation = await TeamInvitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    // Vérifier que l'invitation est en attente
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Cette invitation ne peut plus être annulée' });
    }

    // Vérifier que l'utilisateur est un leader de l'équipe ou admin
    const team = await Team.findById(invitation.team);
    const isLeader = team.leaders.some(l => l.toString() === req.user.id);
    if (!isLeader && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à annuler cette invitation' });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    res.json({ message: 'Invitation annulée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Récupérer toutes les invitations (Admin)
// @route   GET /api/invitations
// @access  Private/Admin
const getAllInvitations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const invitations = await TeamInvitation.find(query)
      .populate('team', 'name')
      .populate('invitedUser', 'firstName lastName email')
      .populate('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TeamInvitation.countDocuments(query);

    res.json({
      invitations,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getMyReceivedInvitations,
  getMySentInvitations,
  getInvitationById,
  respondToInvitation,
  cancelInvitation,
  getAllInvitations
};

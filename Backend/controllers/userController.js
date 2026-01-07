const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get user profile
// GET /api/users/profile
// Private
const getProfile = async (req, res) => {
  try {
    const Team = require('../models/Team');
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('team', 'name description')
      .populate('submissions')
      .populate('registeredProjects', 'title status');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur a une référence d'équipe et si cette équipe existe vraiment
    let teamData = null;
    if (user.team) {
      // Si populate a retourné null mais que user.team (ID) existe, vérifier si l'équipe existe
      const teamExists = await Team.findById(user.team._id || user.team);
      if (teamExists) {
        teamData = {
          _id: teamExists._id,
          name: teamExists.name,
          description: teamExists.description
        };
      } else {
        // Nettoyer la référence orpheline
        await User.findByIdAndUpdate(user._id, {
          $unset: { team: 1 },
          isTeamLeader: false
        });
        user.team = null;
        user.isTeamLeader = false;
      }
    }

    // Build response with complete profile data
    const profileData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      bio: user.bio || '',
      points: user.points || 0,
      role: user.role,
      team: teamData,
      isTeamLeader: user.isTeamLeader || false,
      submissionsCount: user.submissions?.length || 0,
      registeredProjectsCount: user.registeredProjects?.length || 0,
      registeredProjects: user.registeredProjects,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(profileData);
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get all users
// GET /api/users
// Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('team', 'name')
      .populate('registeredProjects', 'title')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get user by ID
// GET /api/users/:id
// Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('team', 'name description')
      .populate('submissions')
      .populate('registeredProjects', 'title');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update user
// PUT /api/users/:id
// Private
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, userName, bio } = req.body;

    // Vérifier si l'utilisateur modifie son propre profil ou est admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier ce profil' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (userName) user.userName = userName;
    if (bio) user.bio = bio;
    user.updatedAt = new Date();

    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Delete user
// DELETE /api/users/:id
// Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Change password
// PUT /api/users/:id/password
// Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier si l'utilisateur modifie son propre mot de passe
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get users leaderboard
// GET /api/users/leaderboard
// Public
const getUsersLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('firstName lastName userName points')
      .sort({ points: -1 })
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update user partially
// PATCH /api/users/:id
// Private
const patchUser = async (req, res) => {
  try {
    // Check permissions
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Mettre à jour uniquement les champs envoyés
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Create user (Admin)
// POST /api/users
// Private/Admin
const adminCreateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userName, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const userNameExists = await User.findOne({ userName });
    if (userNameExists) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userName,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      role: user.role
    });
  } catch (error) {
    console.error('Erreur adminCreateUser:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser,
  changePassword,
  getUsersLeaderboard,
  adminCreateUser
};

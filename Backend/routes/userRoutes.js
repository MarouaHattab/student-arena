const express = require('express');
const router = express.Router();
const {
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser,
  changePassword,
  getUsersLeaderboard
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateUpdateUser, validateChangePassword, validateMongoId } = require('../middleware/validationMiddleware');

// Routes publiques
router.get('/leaderboard', getUsersLeaderboard);

// Route profil utilisateur connecté
router.get('/profile', protect, getProfile);

// Routes protégées
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, validateMongoId, getUserById);
router.put('/:id', protect, validateMongoId, validateUpdateUser, updateUser);
router.patch('/:id', protect, validateMongoId, validateUpdateUser, patchUser);
router.delete('/:id', protect, admin, validateMongoId, deleteUser);
router.put('/:id/password', protect, validateMongoId, validateChangePassword, changePassword);

module.exports = router;


const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const {
  getUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser,
  changePassword,
  getUsersLeaderboard
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validation rules
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La bio ne peut pas dépasser 500 caractères')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
];

// Routes publiques
router.get('/leaderboard', getUsersLeaderboard);

// Routes protégées
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUserValidation, validate, updateUser);
router.patch('/:id', protect, updateUserValidation, validate, patchUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/password', protect, changePasswordValidation, validate, changePassword);

module.exports = router;

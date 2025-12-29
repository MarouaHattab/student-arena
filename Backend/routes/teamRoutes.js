const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  joinTeamByCode,
  leaveTeam,
  removeMember,
  giveLeadership,
  removeLeadership
} = require('../controllers/teamController');
const { protect, admin, teamLeader } = require('../middleware/authMiddleware');

// Validation rules
const createTeamValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom de l\'équipe est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  body('slogan')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Le slogan ne peut pas dépasser 200 caractères'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 5 }).withMessage('Le nombre maximum de membres doit être entre 2 et 5')
];

const updateTeamValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  body('slogan')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Le slogan ne peut pas dépasser 200 caractères'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived']).withMessage('Statut invalide')
];

const inviteMemberValidation = [
  body('emailOrUsername')
    .trim()
    .notEmpty().withMessage('L\'email ou le username est requis')
];

const joinByCodeValidation = [
  body('invitationCode')
    .trim()
    .notEmpty().withMessage('Le code d\'invitation est requis')
    .isLength({ min: 8, max: 8 }).withMessage('Le code d\'invitation doit contenir 8 caractères')
];

// Routes publiques
router.get('/', getTeams);
router.get('/:id', getTeamById);

// Routes protégées
router.post('/', protect, createTeamValidation, validate, createTeam);
router.put('/:id', protect, teamLeader, updateTeamValidation, validate, updateTeam);
router.delete('/:id', protect, teamLeader, deleteTeam);

// Gestion des membres
router.post('/:id/invite', protect, teamLeader, inviteMemberValidation, validate, inviteMember);
router.post('/join', protect, joinByCodeValidation, validate, joinTeamByCode);
router.post('/:id/leave', protect, leaveTeam);
router.delete('/:id/members/:memberId', protect, teamLeader, removeMember);

// Gestion du leadership
router.post('/:id/give-leadership/:userId', protect, teamLeader, giveLeadership);
router.delete('/:id/remove-leadership/:userId', protect, teamLeader, removeLeadership);

module.exports = router;

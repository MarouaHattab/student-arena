const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  reviewSubmission,
  rankSubmission,
  getMySubmissions
} = require('../controllers/submissionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validation rules
const createSubmissionValidation = [
  body('project')
    .notEmpty().withMessage('Le projet est requis')
    .isMongoId().withMessage('ID de projet invalide'),
  body('githubLink')
    .trim()
    .notEmpty().withMessage('Le lien GitHub est requis')
    .matches(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/).withMessage('Le lien GitHub doit être un URL GitHub valide'),
  body('teamId')
    .optional()
    .isMongoId().withMessage('ID d\'équipe invalide')
];

const updateSubmissionValidation = [
  body('githubLink')
    .optional()
    .trim()
    .matches(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/).withMessage('Le lien GitHub doit être un URL GitHub valide')
];

const reviewSubmissionValidation = [
  body('status')
    .notEmpty().withMessage('Le statut est requis')
    .isIn(['approved', 'rejected']).withMessage('Le statut doit être "approved" ou "rejected"'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Le score doit être entre 0 et 100'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Le feedback ne peut pas dépasser 2000 caractères')
];

const rankSubmissionValidation = [
  body('ranking')
    .notEmpty().withMessage('Le classement est requis')
    .isInt({ min: 1 }).withMessage('Le classement doit être un entier positif')
];

// Routes protégées utilisateur
router.get('/my-submissions', protect, getMySubmissions);
router.post('/', protect, createSubmissionValidation, validate, createSubmission);
router.put('/:id', protect, updateSubmissionValidation, validate, updateSubmission);
router.delete('/:id', protect, deleteSubmission);

// Routes admin
router.get('/', protect, admin, getSubmissions);
router.get('/:id', protect, getSubmissionById);
router.put('/:id/review', protect, admin, reviewSubmissionValidation, validate, reviewSubmission);
router.put('/:id/rank', protect, admin, rankSubmissionValidation, validate, rankSubmission);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  registerToProject,
  changeProjectStatus,
  getActiveProjects
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validation rules
const createProjectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 5000 }).withMessage('La description doit contenir entre 10 et 5000 caractères'),
  body('successCriteria')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Les critères de succès ne peuvent pas dépasser 2000 caractères'),
  body('type')
    .notEmpty().withMessage('Le type est requis')
    .isIn(['individual', 'team']).withMessage('Le type doit être "individual" ou "team"'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Date de début invalide'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('Date de fin invalide'),
  body('tags')
    .optional()
    .isArray().withMessage('Les tags doivent être un tableau')
];

const updateProjectValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('La description doit contenir entre 10 et 5000 caractères'),
  body('successCriteria')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Les critères de succès ne peuvent pas dépasser 2000 caractères'),
  body('type')
    .optional()
    .isIn(['individual', 'team']).withMessage('Le type doit être "individual" ou "team"'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived']).withMessage('Statut invalide')
];

const changeStatusValidation = [
  body('status')
    .notEmpty().withMessage('Le statut est requis')
    .isIn(['draft', 'active', 'completed', 'archived']).withMessage('Statut invalide')
];

// Routes publiques
router.get('/', getProjects);
router.get('/active', getActiveProjects);
router.get('/:id', getProjectById);

// Routes protégées
router.post('/', protect, admin, createProjectValidation, validate, createProject);
router.put('/:id', protect, admin, updateProjectValidation, validate, updateProject);
router.delete('/:id', protect, admin, deleteProject);
router.post('/:id/register', protect, registerToProject);
router.put('/:id/status', protect, admin, changeStatusValidation, validate, changeProjectStatus);

module.exports = router;

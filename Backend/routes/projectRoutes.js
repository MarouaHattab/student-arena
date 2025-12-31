const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  registerToProject,
  changeProjectStatus,
  getActiveProjects,
  getUserProjects,
  getTeamProjects,
  getProjectParticipants
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCreateProject, validateUpdateProject, validateMongoId } = require('../middleware/validationMiddleware');

// Routes publiques
router.get('/', getProjects);
router.get('/active', getActiveProjects);

// Routes protégées - Routes spécifiques AVANT les routes avec :id
router.get('/my-projects', protect, getUserProjects);
router.get('/team-projects', protect, getTeamProjects);

// Routes avec :id (après les routes spécifiques)
router.get('/:id/participants', validateMongoId, getProjectParticipants);
router.get('/:id', validateMongoId, getProjectById);
router.post('/', protect, admin, validateCreateProject, createProject);
router.put('/:id', protect, admin, validateMongoId, validateUpdateProject, updateProject);
router.delete('/:id', protect, admin, validateMongoId, deleteProject);
router.post('/:id/register', protect, validateMongoId, registerToProject);
router.put('/:id/status', protect, admin, validateMongoId, changeProjectStatus);

module.exports = router;

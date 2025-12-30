const express = require('express');
const router = express.Router();
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
const { validateCreateTeam, validateUpdateTeam, validateMongoId } = require('../middleware/validationMiddleware');

// Routes publiques
router.get('/', getTeams);
router.get('/:id', validateMongoId, getTeamById);

// Routes protégées
router.post('/', protect, validateCreateTeam, createTeam);
router.put('/:id', protect, teamLeader, validateMongoId, validateUpdateTeam, updateTeam);
router.delete('/:id', protect, teamLeader, validateMongoId, deleteTeam);

// Gestion des membres
router.post('/:id/invite', protect, teamLeader, validateMongoId, inviteMember);
router.post('/join', protect, joinTeamByCode);
router.post('/:id/leave', protect, validateMongoId, leaveTeam);
router.delete('/:id/members/:memberId', protect, teamLeader, validateMongoId, removeMember);

// Gestion du leadership
router.post('/:id/give-leadership/:userId', protect, teamLeader, validateMongoId, giveLeadership);
router.delete('/:id/remove-leadership/:userId', protect, teamLeader, validateMongoId, removeLeadership);

module.exports = router;

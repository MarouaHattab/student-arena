const express = require('express');
const router = express.Router();
const {
  getUsersLeaderboard,
  getTeamsLeaderboard,
  getProjectLeaderboard,
  getGlobalLeaderboard,
  updateLeaderboard,
  getUserPosition,
  getTeamPosition
} = require('../controllers/leaderboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', getGlobalLeaderboard);
router.get('/users', getUsersLeaderboard);
router.get('/teams', getTeamsLeaderboard);
router.get('/project/:projectId', getProjectLeaderboard);
router.get('/user/:userId/position', getUserPosition);
router.get('/team/:teamId/position', getTeamPosition);

// Routes admin
router.post('/update', protect, admin, updateLeaderboard);

module.exports = router;

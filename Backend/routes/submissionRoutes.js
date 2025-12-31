const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  reviewSubmission,
  rankSubmission,
  getMySubmissions,
  getTeamSubmissions,
  addPoints
} = require('../controllers/submissionController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCreateSubmission, validateUpdateSubmission, validateMongoId } = require('../middleware/validationMiddleware');

// Routes protégées utilisateur
router.get('/my-submissions', protect, getMySubmissions);
router.get('/team/:teamId', protect, getTeamSubmissions);
router.post('/', protect, validateCreateSubmission, createSubmission);
router.put('/:id', protect, validateMongoId, validateUpdateSubmission, updateSubmission);
router.delete('/:id', protect, validateMongoId, deleteSubmission);

// Routes admin
router.get('/', protect, admin, getSubmissions);
router.get('/:id', protect, validateMongoId, getSubmissionById);
router.put('/:id/review', protect, admin, validateMongoId, reviewSubmission);
router.put('/:id/rank', protect, admin, validateMongoId, rankSubmission);
router.post('/add-points', protect, admin, addPoints);

module.exports = router;

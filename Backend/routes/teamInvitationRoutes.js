const express = require('express');
const router = express.Router();
const {
  getMyReceivedInvitations,
  getMySentInvitations,
  getInvitationById,
  respondToInvitation,
  cancelInvitation,
  getAllInvitations
} = require('../controllers/teamInvitationController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCreateInvitation, validateMongoId } = require('../middleware/validationMiddleware');

// Routes protégées utilisateur
router.get('/received', protect, getMyReceivedInvitations);
router.get('/sent', protect, getMySentInvitations);
router.get('/:id', protect, validateMongoId, getInvitationById);
router.put('/:id/respond', protect, validateMongoId, respondToInvitation);

// Routes team leader
router.delete('/:id', protect, validateMongoId, cancelInvitation);

// Routes admin
router.get('/', protect, admin, getAllInvitations);

module.exports = router;

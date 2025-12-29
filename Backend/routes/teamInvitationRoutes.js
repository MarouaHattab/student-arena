const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const {
  getMyReceivedInvitations,
  getMySentInvitations,
  getInvitationById,
  respondToInvitation,
  cancelInvitation,
  getAllInvitations
} = require('../controllers/teamInvitationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validation rules
const respondValidation = [
  body('response')
    .notEmpty().withMessage('La réponse est requise')
    .isIn(['accepted', 'rejected']).withMessage('La réponse doit être "accepted" ou "rejected"')
];

// Routes protégées utilisateur
router.get('/received', protect, getMyReceivedInvitations);
router.get('/sent', protect, getMySentInvitations);
router.get('/:id', protect, getInvitationById);
router.put('/:id/respond', protect, respondValidation, validate, respondToInvitation);

// Routes team leader
router.delete('/:id', protect, cancelInvitation);

// Routes admin
router.get('/', protect, admin, getAllInvitations);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', protect, refreshToken);

module.exports = router;

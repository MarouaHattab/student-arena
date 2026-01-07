const express = require('express');
const router = express.Router();
const {
  // Projet
  generateProjectTags,
  improveProjectDescription,
  generateSuccessCriteria,
  // User
  generateUserBio,
  // Recommandations
  recommendProjects,

  // Chatbot
  chatAssistant,
  // Resumes
  generateProjectSummary,
  generateUserSummary,
  // Génération de contenu
  generateProjectIdea
} = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

// ******routes projet ******
// Generate tags from a description
router.post('/generate-tags', protect, generateProjectTags);

// Improve/rewrite a project description
router.post('/improve-description', protect, improveProjectDescription);

// Generate success criteria
router.post('/generate-criteria', protect, generateSuccessCriteria);

// ******routes user ******
// Generate user bio
router.post('/generate-bio', protect, generateUserBio);

// ******routes recommandations ******
// Get personalized project recommendations
router.get('/recommend-projects', protect, recommendProjects);

// ******routes chatbot ******
// Chatbot assistant
router.post('/chat', protect, chatAssistant);

// ******routes resume ******
// Intelligent project summary
router.get('/project-summary/:projectId', protect, generateProjectSummary);

// User profile summary
router.get('/user-summary/:userId', protect, generateUserSummary);

// ******routes generation ******
// Generate project idea
router.post('/generate-project-idea', protect, generateProjectIdea);

module.exports = router;

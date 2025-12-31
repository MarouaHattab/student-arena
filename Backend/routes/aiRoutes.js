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
  // Résumés
  generateProjectSummary,
  generateUserSummary,
  // Génération de contenu
  generateProjectIdea,
  generateTeamFeedback
} = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

// ==================== ROUTES PROJET ====================
// Générer des tags à partir d'une description
router.post('/generate-tags', protect, generateProjectTags);

// Améliorer/reformuler une description de projet
router.post('/improve-description', protect, improveProjectDescription);

// Générer des critères de succès
router.post('/generate-criteria', protect, generateSuccessCriteria);

// ==================== ROUTES USER ====================
// Générer une bio utilisateur
router.post('/generate-bio', protect, generateUserBio);

// ==================== ROUTES RECOMMANDATIONS ====================
// Obtenir des recommandations de projets personnalisées
router.get('/recommend-projects', protect, recommendProjects);

// ==================== ROUTES CHATBOT ====================
// Chatbot d'assistance
router.post('/chat', protect, chatAssistant);

// ==================== ROUTES RÉSUMÉS ====================
// Résumé intelligent d'un projet
router.get('/project-summary/:projectId', protect, generateProjectSummary);

// Résumé du profil utilisateur
router.get('/user-summary/:userId', protect, generateUserSummary);

// ==================== ROUTES GÉNÉRATION DE CONTENU ====================
// Générer une idée de projet
router.post('/generate-project-idea', protect, generateProjectIdea);

// Générer un feedback pour une équipe (Admin seulement)
router.post('/team-feedback', protect, admin, generateTeamFeedback);

module.exports = router;

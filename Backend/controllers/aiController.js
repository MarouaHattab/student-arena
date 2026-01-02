const { getModel } = require('../config/gemini');
const Project = require('../models/Project');
const User = require('../models/User');
const Submission = require('../models/Submission');

// ==================== PROJET AI FEATURES ====================

// @desc    Générer des tags à partir de la description d'un projet
// @route   POST /api/ai/generate-tags
// @access  Private
const generateProjectTags = async (req, res) => {
  try {
    const { description, title } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'La description est requise' });
    }

    const model = getModel();
    const prompt = `Analyse cette description de projet et génère entre 3 et 7 tags pertinents.
    
Titre: ${title || 'Non spécifié'}
Description: ${description}

Réponds UNIQUEMENT avec un tableau JSON de tags (en minuscules, sans espaces, utilisez des tirets si nécessaire).
Exemple de format: ["web-development", "react", "api", "database"]

Tags:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extraire le tableau JSON de la réponse
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0]);
      return res.json({ 
        success: true,
        tags: tags.slice(0, 7) // Maximum 7 tags
      });
    }

    res.status(500).json({ message: 'Erreur lors de la génération des tags' });
  } catch (error) {
    console.error('Erreur generateProjectTags:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Reformuler/Améliorer la description d'un projet
// @route   POST /api/ai/improve-description
// @access  Private
const improveProjectDescription = async (req, res) => {
  try {
    const { description, title, style } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'La description est requise' });
    }

    const styleInstructions = {
      professional: 'Utilise un ton professionnel et formel.',
      casual: 'Utilise un ton décontracté et accessible.',
      technical: 'Utilise un vocabulaire technique et précis.',
      creative: 'Utilise un ton créatif et engageant.'
    };

    const model = getModel();
    const prompt = `Tu es un expert en rédaction de descriptions de projets.
    
Améliore et reformule cette description de projet pour la rendre plus claire, engageante et professionnelle.
${styleInstructions[style] || styleInstructions.professional}

Titre du projet: ${title || 'Non spécifié'}
Description originale: ${description}

Règles:
- Garde le sens original
- Améliore la structure et la clarté
- Corrige les fautes
- Maximum 500 mots
- Réponds UNIQUEMENT avec la nouvelle description, sans commentaires

Description améliorée:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedDescription = response.text().trim();

    res.json({ 
      success: true,
      originalDescription: description,
      improvedDescription 
    });
  } catch (error) {
    console.error('Erreur improveProjectDescription:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Générer des critères de succès pour un projet
// @route   POST /api/ai/generate-criteria
// @access  Private
const generateSuccessCriteria = async (req, res) => {
  try {
    const { description, title, type } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'La description est requise' });
    }

    const model = getModel();
    const prompt = `Tu es un expert en gestion de projets compétitifs.

Génère des critères de succès clairs et mesurables pour ce projet de compétition.

Titre: ${title || 'Non spécifié'}
Type: ${type === 'team' ? 'Projet en équipe' : 'Projet individuel'}
Description: ${description}

Génère 5 à 8 critères de succès sous forme de liste numérotée.
Chaque critère doit être:
- Spécifique et mesurable
- Réaliste
- Pertinent pour une compétition

Réponds UNIQUEMENT avec les critères, un par ligne:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const criteria = response.text().trim();

    res.json({ 
      success: true,
      successCriteria: criteria
    });
  } catch (error) {
    console.error('Erreur generateSuccessCriteria:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ==================== USER AI FEATURES ====================

// @desc    Générer une bio utilisateur
// @route   POST /api/ai/generate-bio
// @access  Private
const generateUserBio = async (req, res) => {
  try {
    const { firstName, lastName, skills, interests, experience } = req.body;

    const model = getModel();
    const prompt = `Génère une bio professionnelle et engageante pour un profil utilisateur sur une plateforme de compétitions de projets.

Informations:
- Prénom: ${firstName || 'Non spécifié'}
- Nom: ${lastName || 'Non spécifié'}
- Compétences: ${skills || 'Non spécifiées'}
- Intérêts: ${interests || 'Non spécifiés'}
- Expérience: ${experience || 'Non spécifiée'}

Règles:
- Maximum 150 mots
- Ton professionnel mais accessible
- Mentionne la passion pour les défis et la collaboration
- Réponds UNIQUEMENT avec la bio, sans commentaires

Bio:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const bio = response.text().trim();

    res.json({ 
      success: true,
      bio 
    });
  } catch (error) {
    console.error('Erreur generateUserBio:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ==================== RECOMMANDATIONS AI ====================

// @desc    Recommander des projets personnalisés pour un utilisateur
// @route   GET /api/ai/recommend-projects
// @access  Private
const recommendProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Récupérer l'utilisateur et ses projets passés
    const user = await User.findById(userId).populate('registeredProjects');
    const activeProjects = await Project.find({ 
      status: 'active',
      _id: { $nin: user.registeredProjects.map(p => p._id) }
    }).limit(20);

    if (activeProjects.length === 0) {
      return res.json({ 
        success: true,
        recommendations: [],
        message: 'Aucun nouveau projet disponible'
      });
    }

    // Préparer les données pour l'IA
    const userHistory = user.registeredProjects.map(p => ({
      title: p.title,
      tags: p.tags
    }));

    const availableProjects = activeProjects.map(p => ({
      id: p._id,
      title: p.title,
      description: p.description.substring(0, 200),
      tags: p.tags,
      type: p.type
    }));

    const model = getModel();
    const prompt = `Tu es un système de recommandation intelligent.

Historique des projets de l'utilisateur:
${JSON.stringify(userHistory, null, 2)}

Projets disponibles:
${JSON.stringify(availableProjects, null, 2)}

Analyse l'historique de l'utilisateur et recommande les 3 projets les plus pertinents parmi les disponibles.

Réponds UNIQUEMENT avec un tableau JSON contenant les IDs des projets recommandés et une courte raison.
Format: [{"id": "...", "reason": "..."}]

Recommandations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      
      // Enrichir avec les données complètes des projets
      const enrichedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          const project = await Project.findById(rec.id);
          return {
            project,
            reason: rec.reason
          };
        })
      );

      return res.json({ 
        success: true,
        recommendations: enrichedRecommendations.filter(r => r.project)
      });
    }

    res.json({ 
      success: true,
      recommendations: activeProjects.slice(0, 3).map(p => ({ project: p, reason: 'Projet populaire' }))
    });
  } catch (error) {
    console.error('Erreur recommendProjects:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// ==================== CHATBOT AI ====================

// @desc    Chatbot d'assistance
// @route   POST /api/ai/chat
// @access  Private
const chatAssistant = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Le message est requis' });
    }

    const model = getModel();
    
    // Contexte du chatbot
    const systemContext = `Tu es un assistant virtuel pour une plateforme de compétitions de projets.
Tu aides les utilisateurs à:
- Comprendre comment fonctionne la plateforme
- Créer et gérer leurs projets
- Former et gérer leurs équipes
- Soumettre leurs travaux
- Comprendre les règles des compétitions

Réponds de manière concise, amicale et utile. Si tu ne sais pas quelque chose, dis-le honnêtement.`;

    // Construire l'historique de conversation
    let conversationContext = systemContext + '\n\n';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-5).forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    conversationContext += `Utilisateur: ${message}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const reply = response.text().trim();

    res.json({ 
      success: true,
      reply 
    });
  } catch (error) {
    console.error('Erreur chatAssistant:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ==================== RÉSUMÉS INTELLIGENTS ====================

// @desc    Générer un résumé intelligent d'un projet
// @route   GET /api/ai/project-summary/:projectId
// @access  Private
const generateProjectSummary = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'firstName lastName')
      .populate('submissions');

    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const model = getModel();
    const prompt = `Génère un résumé intelligent et engageant de ce projet de compétition.

Titre: ${project.title}
Description: ${project.description}
Type: ${project.type === 'team' ? 'Équipe' : 'Individuel'}
Créé par: ${project.createdBy?.firstName} ${project.createdBy?.lastName}
Tags: ${project.tags?.join(', ') || 'Aucun'}
Nombre de soumissions: ${project.submissions?.length || 0}
Statut: ${project.status}
Date de début: ${project.startDate?.toLocaleDateString('fr-FR') || 'Non définie'}
Date de fin: ${project.endDate?.toLocaleDateString('fr-FR') || 'Non définie'}

Génère:
1. Un résumé accrocheur (2-3 phrases)
2. Les points clés du projet (3-5 bullet points)
3. Le niveau de difficulté estimé (Débutant/Intermédiaire/Avancé)
4. Les compétences requises

Réponds en JSON:
{
  "summary": "...",
  "keyPoints": ["..."],
  "difficulty": "...",
  "requiredSkills": ["..."]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return res.json({ 
        success: true,
        project: {
          _id: project._id,
          title: project.title
        },
        summary 
      });
    }

    res.status(500).json({ message: 'Erreur lors de la génération du résumé' });
  } catch (error) {
    console.error('Erreur generateProjectSummary:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Générer un résumé du profil utilisateur avec statistiques
// @route   GET /api/ai/user-summary/:userId
// @access  Private
const generateUserSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('submissions')
      .populate('registeredProjects')
      .populate('team');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const model = getModel();
    const prompt = `Génère un résumé du profil de cet utilisateur sur une plateforme de compétitions.

Nom: ${user.firstName} ${user.lastName}
Username: ${user.userName}
Bio: ${user.bio || 'Non renseignée'}
Points: ${user.points}
Équipe: ${user.team?.name || 'Aucune'}
Leader d'équipe: ${user.isTeamLeader ? 'Oui' : 'Non'}
Projets inscrits: ${user.registeredProjects?.length || 0}
Soumissions: ${user.submissions?.length || 0}

Génère:
1. Un résumé du profil (2-3 phrases engageantes)
2. Niveau estimé (Débutant/Intermédiaire/Expert)
3. Points forts présumés
4. Conseils personnalisés pour progresser

Réponds en JSON:
{
  "profileSummary": "...",
  "level": "...",
  "strengths": ["..."],
  "tips": ["..."]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return res.json({ 
        success: true,
        user: {
          _id: user._id,
          userName: user.userName,
          points: user.points
        },
        summary 
      });
    }

    res.status(500).json({ message: 'Erreur lors de la génération du résumé' });
  } catch (error) {
    console.error('Erreur generateUserSummary:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ==================== GÉNÉRATION DE CONTENU ====================

// @desc    Générer une idée de projet
// @route   POST /api/ai/generate-project-idea
// @access  Private
const generateProjectIdea = async (req, res) => {
  try {
    const { theme, difficulty, type } = req.body;

    const model = getModel();
    const prompt = `Tu es un expert en création de défis de programmation et projets compétitifs.

Génère une idée de projet innovante et réalisable.

Paramètres:
- Thème/Domaine: ${theme || 'Libre'}
- Difficulté: ${difficulty || 'Intermédiaire'}
- Type: ${type === 'team' ? 'Projet en équipe' : 'Projet individuel'}

Génère:
1. Titre accrocheur
2. Description détaillée (200-300 mots)
3. Tags pertinents (5-7)
4. Critères de succès (5-7)
5. Technologies suggérées

Réponds en JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["..."],
  "successCriteria": "...",
  "suggestedTechnologies": ["..."],
  "estimatedDuration": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const idea = JSON.parse(jsonMatch[0]);
      return res.json({ 
        success: true,
        projectIdea: idea 
      });
    }

    res.status(500).json({ message: 'Erreur lors de la génération' });
  } catch (error) {
    console.error('Erreur generateProjectIdea:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};



module.exports = {
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

};

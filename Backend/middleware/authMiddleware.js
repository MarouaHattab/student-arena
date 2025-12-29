const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, admin requis' });
  }
};

// Middleware pour vérifier si l'utilisateur est leader d'équipe
const teamLeader = (req, res, next) => {
  if (req.user && req.user.isTeamLeader) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, leader d\'équipe requis' });
  }
};

module.exports = { protect, admin, teamLeader };

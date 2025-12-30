const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }
            
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Token invalide' });
        }
    }

    return res.status(401).json({ message: 'Pas de token, accès refusé' });
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Accès refusé, admin requis' });
};

const teamLeader = (req, res, next) => {
    if (req.user && req.user.isTeamLeader) {
        return next();
    }
    return res.status(403).json({ message: 'Accès refusé, leader d\'équipe requis' });
};

module.exports = { protect, admin, teamLeader };

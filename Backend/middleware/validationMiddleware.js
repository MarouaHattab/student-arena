const { body, param, validationResult } = require('express-validator');

// middleware pour gerer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// *********************** auth validations *****************************

const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le prenom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le prenom contient des caracteres invalides'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom contient des caractères invalides'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  
  body('userName')
    .trim()
    .notEmpty().withMessage('Le nom d\'utilisateur est requis')
    .isLength({ min: 3, max: 30 }).withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide'),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
  
  handleValidationErrors
];

// *********************** user validations *****************************

const validateUpdateUser = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Le prenom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le prenom contient des caracteres invalides'),
  
  body('lastName')  
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom contient des caracteres invalides'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format d\'email invalide')
    .normalizeEmail(),
  
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  
  handleValidationErrors
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis'),
  
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  
  handleValidationErrors
];

// *********************** team validations *****************************

const validateCreateTeam = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom de l\'equipe est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom de l\'equipe doit contenir entre 2 et 50 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  
  handleValidationErrors
];

const validateUpdateTeam = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Le nom de l\'equipe doit contenir entre 2 et 50 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas depasser 500 caracteres'),
  
  handleValidationErrors
];

// *********************** project validations *****************************

const validateCreateProject = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre du projet est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caracteres'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 5000 }).withMessage('La description doit contenir entre 10 et 5000 caracteres'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Format de date de debut invalide'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Format de date de fin invalide'),
  
  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La taille maximale d\'equipe doit être entre 1 et 100'),
  
  handleValidationErrors
];

const validateUpdateProject = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('La description doit contenir entre 10 et 5000 caractères'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Format de date de début invalide'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Format de date de fin invalide'),
  
  handleValidationErrors
];

// *********************** submission validations *****************************

const validateCreateSubmission = [
  body('projectId')
    .notEmpty().withMessage('L\'ID du projet est requis')
    .isMongoId().withMessage('ID de projet invalide'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Le contenu ne peut pas dépasser 10000 caractères'),
  
  body('repositoryUrl')
    .optional()
    .trim()
    .isURL().withMessage('URL du repository invalide'),
  
  handleValidationErrors
];

const validateUpdateSubmission = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Le contenu ne peut pas dépasser 10000 caractères'),
  
  body('repositoryUrl')
    .optional()
    .trim()
    .isURL().withMessage('URL du repository invalide'),
  
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Le score doit être entre 0 et 100'),
  
  handleValidationErrors
];

// *********************** invitation validations *****************************

const validateCreateInvitation = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format d\'email invalide'),
  
  body('userId')
    .optional()
    .isMongoId().withMessage('ID utilisateur invalide'),
  
  handleValidationErrors
];

// *********************** common validations *****************************

const validateMongoId = [
  param('id')
    .isMongoId().withMessage('ID invalide'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  // auth
  validateRegister,
  validateLogin,
  // user
  validateUpdateUser,
  validateChangePassword,
  // team
  validateCreateTeam,
  validateUpdateTeam,
  // project
  validateCreateProject,
  validateUpdateProject,
  // submission
  validateCreateSubmission,
  validateUpdateSubmission,
  // invitation
  validateCreateInvitation,
  // common
  validateMongoId
};

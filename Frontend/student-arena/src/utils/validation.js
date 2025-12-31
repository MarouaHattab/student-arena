// ==================== AUTH VALIDATIONS ====================

export const validateRegister = (formData) => {
  const errors = {};

  // FirstName validation
  if (!formData.firstName || !formData.firstName.trim()) {
    errors.firstName = 'Le prénom est requis';
  } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
    errors.firstName = 'Le prénom doit contenir entre 2 et 50 caractères';
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.firstName)) {
    errors.firstName = 'Le prénom contient des caractères invalides';
  }

  // LastName validation
  if (!formData.lastName || !formData.lastName.trim()) {
    errors.lastName = 'Le nom est requis';
  } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
    errors.lastName = 'Le nom doit contenir entre 2 et 50 caractères';
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.lastName)) {
    errors.lastName = 'Le nom contient des caractères invalides';
  }

  // Email validation
  if (!formData.email || !formData.email.trim()) {
    errors.email = "L'email est requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format d'email invalide";
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Le mot de passe est requis';
  } else if (formData.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
  }

  // UserName validation
  if (!formData.userName || !formData.userName.trim()) {
    errors.userName = "Le nom d'utilisateur est requis";
  } else if (formData.userName.trim().length < 3 || formData.userName.trim().length > 30) {
    errors.userName = "Le nom d'utilisateur doit contenir entre 3 et 30 caractères";
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
    errors.userName = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores";
  }

  return errors;
};

export const validateLogin = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email || !formData.email.trim()) {
    errors.email = "L'email est requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format d'email invalide";
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Le mot de passe est requis';
  }

  return errors;
};

// Helper function to check if there are any errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

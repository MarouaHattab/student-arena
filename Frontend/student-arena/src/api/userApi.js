import API from './axiosConfig';

export const userAPI = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await API.get('/users/profile');
    return response.data;
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (userId, userData) => {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Mettre à jour partiellement le profil (PATCH)
  patchProfile: async (userId, userData) => {
    const response = await API.patch(`/users/${userId}`, userData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (userId, passwordData) => {
    const response = await API.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUserById: async (userId) => {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  },

  // Récupérer le leaderboard
  getLeaderboard: async () => {
    const response = await API.get('/users/leaderboard');
    return response.data;
  }
};

export const aiAPI = {
  // Générer une bio avec l'IA
  generateBio: async (bioData) => {
    const response = await API.post('/ai/generate-bio', bioData);
    return response.data;
  },

  // Obtenir le résumé du profil utilisateur
  getUserSummary: async (userId) => {
    const response = await API.get(`/ai/user-summary/${userId}`);
    return response.data;
  }
};

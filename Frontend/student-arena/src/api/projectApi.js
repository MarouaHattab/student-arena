import API from './axiosConfig';

export const projectAPI = {
  // Récupérer tous les projets
  getProjects: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await API.get(`/projects${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Récupérer les projets actifs
  getActiveProjects: async () => {
    const response = await API.get('/projects/active');
    return response.data;
  },

  // Récupérer un projet par ID
  getProjectById: async (projectId) => {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  },

  // Récupérer mes projets
  getMyProjects: async () => {
    const response = await API.get('/projects/my-projects');
    return response.data;
  },

  // Récupérer les projets de mon équipe
  getTeamProjects: async () => {
    const response = await API.get('/projects/team-projects');
    return response.data;
  },

  // Récupérer les participants d'un projet
  getProjectParticipants: async (projectId) => {
    const response = await API.get(`/projects/${projectId}/participants`);
    return response.data;
  },

  // S'inscrire à un projet
  registerToProject: async (projectId) => {
    const response = await API.post(`/projects/${projectId}/register`);
    return response.data;
  },

  // === ADMIN ONLY ===

  // Créer un projet
  createProject: async (projectData) => {
    const response = await API.post('/projects', projectData);
    return response.data;
  },

  // Mettre à jour un projet
  updateProject: async (projectId, projectData) => {
    const response = await API.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Supprimer un projet
  deleteProject: async (projectId) => {
    const response = await API.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Changer le statut d'un projet
  changeStatus: async (projectId, status) => {
    const response = await API.put(`/projects/${projectId}/status`, { status });
    return response.data;
  }
};

export const projectAiAPI = {
  // Générer des tags pour un projet
  generateTags: async (title, description) => {
    const response = await API.post('/ai/generate-tags', { title, description });
    return response.data;
  },

  // Améliorer la description d'un projet
  improveDescription: async (title, description, style = 'professional') => {
    const response = await API.post('/ai/improve-description', { title, description, style });
    return response.data;
  },

  // Générer des critères de succès
  generateCriteria: async (title, description, type) => {
    const response = await API.post('/ai/generate-criteria', { title, description, type });
    return response.data;
  },

  // Générer une idée de projet
  generateProjectIdea: async (theme, difficulty, type) => {
    const response = await API.post('/ai/generate-project-idea', { theme, difficulty, type });
    return response.data;
  },

  // Résumé du projet
  getProjectSummary: async (projectId) => {
    const response = await API.get(`/ai/project-summary/${projectId}`);
    return response.data;
  }
};

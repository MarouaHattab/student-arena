import API from './axiosConfig';

export const teamAPI = {
  // Récupérer toutes les équipes
  getTeams: async () => {
    const response = await API.get('/teams');
    return response.data;
  },

  // Récupérer une équipe par ID
  getTeamById: async (teamId) => {
    const response = await API.get(`/teams/${teamId}`);
    return response.data;
  },

  // Créer une nouvelle équipe
  createTeam: async (teamData) => {
    const response = await API.post('/teams', teamData);
    return response.data;
  },

  // Mettre à jour une équipe
  updateTeam: async (teamId, teamData) => {
    const response = await API.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Supprimer une équipe
  deleteTeam: async (teamId) => {
    const response = await API.delete(`/teams/${teamId}`);
    return response.data;
  },

  // Rejoindre une équipe avec un code d'invitation
  joinByCode: async (invitationCode) => {
    const response = await API.post('/teams/join', { invitationCode });
    return response.data;
  },

  // Quitter une équipe
  leaveTeam: async (teamId) => {
    const response = await API.post(`/teams/${teamId}/leave`);
    return response.data;
  },

  // Ajouter un membre (par email ou username)
  addMember: async (teamId, emailOrUsername) => {
    const response = await API.post(`/teams/${teamId}/add-member`, { emailOrUsername });
    return response.data;
  },

  // Retirer un membre
  removeMember: async (teamId, memberId) => {
    const response = await API.delete(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },

  // Donner le leadership
  giveLeadership: async (teamId, userId) => {
    const response = await API.post(`/teams/${teamId}/give-leadership/${userId}`);
    return response.data;
  },

  // Retirer le leadership
  removeLeadership: async (teamId, userId) => {
    const response = await API.delete(`/teams/${teamId}/remove-leadership/${userId}`);
    return response.data;
  }
};

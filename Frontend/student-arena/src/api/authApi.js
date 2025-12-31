import API from './axiosConfig';

export const authAPI = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await API.post('/auth/refresh-token');
    return response.data;
  },
};

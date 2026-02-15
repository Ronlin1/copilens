import axios from 'axios';
import { ENV } from '../config/env';

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

export const apiService = {
  analyzeRepository: async (repoUrl) => {
    const response = await api.post('/analyze', { repo_url: repoUrl });
    return response.data;
  },
  getRepoStats: async (repoUrl) => {
    const response = await api.get('/stats?repo_url=' + encodeURIComponent(repoUrl));
    return response.data;
  }
};

export default api;

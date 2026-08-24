import axios from 'axios';
import i18n from '../i18n';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Every request tells the backend which language is active, so API-generated
// messages (validation errors, etc.) come back in the right language too.
apiClient.interceptors.request.use((config) => {
  config.headers['X-Lang'] = i18n.language;
  return config;
});

export default apiClient;

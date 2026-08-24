import axios from 'axios';
import i18n from '../i18n';

const TOKEN_KEY = 'o2smart_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-Lang'] = i18n.language;
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized 401 handling: drop the stale token and let the app redirect to
// /login via the ProtectedRoute check on next render.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setToken(null);
    }
    return Promise.reject(err);
  }
);

export default apiClient;

// Environment configuration
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Copilens',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'AI-Powered Repository Analysis',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  ENABLE_CHAT: import.meta.env.VITE_ENABLE_CHAT === 'true',
  ENABLE_DEPLOY: import.meta.env.VITE_ENABLE_DEPLOY === 'true',
};

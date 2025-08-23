// Configuration for the Chrome Extension
export const EXTENSION_CONFIG = {
  // Web app URL - update this to match your frontend URL
  WEB_APP_URL: 'http://localhost:5174',
  
  // Login page path
  LOGIN_PATH: '/login',
  
  // Full login URL
  get LOGIN_URL() {
    return `${this.WEB_APP_URL}${this.LOGIN_PATH}`;
  },
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKENS: 'auth_tokens',
  } as const,
} as const;

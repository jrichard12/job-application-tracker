const API_URL = import.meta.env.VITE_API_URL as string;
const WEB_APP_URL =
  import.meta.env.DEV
    ? 'http://localhost:5174' // local dev server
    : import.meta.env.VITE_WEB_APP_URL as string; 

export const EXTENSION_CONFIG = {
  WEB_APP_URL,
  API_URL,

  get JOB_HANDLER_URL() {
    return `${API_URL}/job`;
  },

  get USER_INFO_URL() {
    return `${API_URL}/user`;
  },

  get LOGIN_URL() {
    return `${WEB_APP_URL}/login`;
  },

  STORAGE_KEYS: {
    AUTH_TOKENS: "auth_tokens",
  } as const,
} as const;
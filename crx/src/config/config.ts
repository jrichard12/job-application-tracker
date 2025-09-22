const JOB_HANDLER_URL = import.meta.env.VITE_JOB_HANDLER_URL as string;
const USER_INFO_URL = import.meta.env.VITE_USER_INFO_URL as string;
const WEB_APP_URL =
  import.meta.env.DEV
    ? 'http://localhost:5174' // local dev server
    : import.meta.env.VITE_WEB_APP_URL as string; 

export const EXTENSION_CONFIG = {
  WEB_APP_URL,
  JOB_HANDLER_URL,
  USER_INFO_URL,

  get LOGIN_URL() {
    return `${WEB_APP_URL}/login`;
  },

  STORAGE_KEYS: {
    AUTH_TOKENS: "auth_tokens",
  } as const,
} as const;
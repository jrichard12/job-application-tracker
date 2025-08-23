// Storage service for Chrome Extension
export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  expiresAt: number; // timestamp when tokens expire
}

const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
} as const;

export class ChromeStorageService {
  /**
   * Store authentication tokens in chrome.storage.local
   */
  static async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.AUTH_TOKENS]: tokens
      });
      console.log('[ChromeStorage] Tokens stored successfully');
    } catch (error) {
      console.error('[ChromeStorage] Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieve authentication tokens from chrome.storage.local
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKENS);
      const tokens = result[STORAGE_KEYS.AUTH_TOKENS];
      
      if (!tokens) {
        console.log('[ChromeStorage] No tokens found');
        return null;
      }

      // Check if tokens are expired
      if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
        console.log('[ChromeStorage] Tokens expired, removing from storage');
        await this.clearTokens();
        return null;
      }

      return tokens;
    } catch (error) {
      console.error('[ChromeStorage] Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens from chrome.storage.local
   */
  static async clearTokens(): Promise<void> {
    try {
      await chrome.storage.local.remove(STORAGE_KEYS.AUTH_TOKENS);
      console.log('[ChromeStorage] Tokens cleared successfully');
    } catch (error) {
      console.error('[ChromeStorage] Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }

  /**
   * Get user info from stored tokens
   */
  static async getUserInfo(): Promise<{ userId: string; username: string } | null> {
    const tokens = await this.getTokens();
    if (!tokens) return null;
    
    return {
      userId: tokens.userId,
      username: tokens.username
    };
  }
}

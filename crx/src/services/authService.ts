import { EXTENSION_CONFIG } from '../config/config';

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  expiresAt: number; // timestamp when tokens expire
}

export class ExtensionAuthService {
  // ===== PRIVATE STORAGE METHODS =====
  
  /**
   * Store authentication tokens in chrome.storage.local
   */
  private static async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await chrome.storage.local.set({
        [EXTENSION_CONFIG.STORAGE_KEYS.AUTH_TOKENS]: tokens
      });
      console.log('[Auth] Tokens stored successfully');
    } catch (error) {
      console.error('[Auth] Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieve authentication tokens from chrome.storage.local
   */
  private static async getTokens(): Promise<AuthTokens | null> {
    try {
      const result = await chrome.storage.local.get(EXTENSION_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
      const tokens = result[EXTENSION_CONFIG.STORAGE_KEYS.AUTH_TOKENS];
      
      if (!tokens) {
        console.log('[Auth] No tokens found');
        return null;
      }

      // Check if tokens are expired
      if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
        console.log('[Auth] Tokens expired, removing from storage');
        await this.clearTokens();
        return null;
      }

      return tokens;
    } catch (error) {
      console.error('[Auth] Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens from chrome.storage.local
   */
  private static async clearTokens(): Promise<void> {
    try {
      await chrome.storage.local.remove(EXTENSION_CONFIG.STORAGE_KEYS.AUTH_TOKENS);
      console.log('[Auth] Tokens cleared successfully');
    } catch (error) {
      console.error('[Auth] Error clearing tokens:', error);
      throw error;
    }
  }

  // ===== PUBLIC AUTH METHODS =====

  /**
   * Store authentication tokens (for background script)
   */
  static async saveAuthTokens(tokens: AuthTokens): Promise<void> {
    await this.storeTokens(tokens);
  }

  /**
   * Get the current user's authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.idToken || null;
  }

  /**
   * Get the current user's ID
   */
  static async getUserId(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.userId || null;
  }

  /**
   * Get the current user info
   */
  static async getCurrentUser(): Promise<{ username: string; userId: string; authToken: string } | null> {
    const tokens = await this.getTokens();
    if (!tokens) return null;

    return {
      username: tokens.username,
      userId: tokens.userId,
      authToken: tokens.idToken
    };
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }

  /**
   * Make an authenticated API request
   */
  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const authToken = await this.getAuthToken();
    
    if (!authToken) {
      throw new Error('User not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  /**
   * Logout the user (clear stored tokens)
   */
  static async logout(): Promise<void> {
    await this.clearTokens();
  }
}

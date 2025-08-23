import { ChromeStorageService } from './storageService';

export class ExtensionAuthService {
  /**
   * Get the current user's authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    const tokens = await ChromeStorageService.getTokens();
    return tokens?.idToken || null;
  }

  /**
   * Get the current user's ID
   */
  static async getUserId(): Promise<string | null> {
    const tokens = await ChromeStorageService.getTokens();
    return tokens?.userId || null;
  }

  /**
   * Get the current user info
   */
  static async getCurrentUser(): Promise<{ username: string; userId: string; authToken: string } | null> {
    const tokens = await ChromeStorageService.getTokens();
    if (!tokens) return null;

    return {
      username: tokens.username,
      userId: tokens.userId,
      authToken: tokens.idToken
    };
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return await ChromeStorageService.isAuthenticated();
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
    await ChromeStorageService.clearTokens();
  }
}

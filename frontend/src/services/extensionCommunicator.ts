// Utility to communicate with Chrome Extension from web app
export interface ExtensionAuthTokens {
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
  userId: string;
  username: string;
  expiresAt?: number;
}

export class ExtensionCommunicator {
  /**
   * Send authentication tokens to Chrome extension after successful login
   */
  static async sendTokensToExtension(tokens: ExtensionAuthTokens): Promise<boolean> {
    try {
      // Try to communicate with extension via custom DOM event
      const event = new CustomEvent('auth-tokens-updated', {
        detail: tokens
      });
      
      console.log('[ExtensionCommunicator] Dispatching auth-tokens-updated event with tokens:', tokens);
      document.dispatchEvent(event);
      
      console.log('[ExtensionCommunicator] Tokens sent to extension via DOM event');
      return true;
    } catch (error) {
      console.error('[ExtensionCommunicator] Error sending tokens to extension:', error);
      return false;
    }
  }

  /**
   * Clear tokens from extension
   */
  static async clearExtensionTokens(): Promise<boolean> {
    try {
      const event = new CustomEvent('auth-tokens-cleared');
      document.dispatchEvent(event);
      
      console.log('[ExtensionCommunicator] Clear tokens event dispatched to extension');
      return true;
    } catch (error) {
      console.error('[ExtensionCommunicator] Error clearing extension tokens:', error);
      return false;
    }
  }

  /**
   * Check if extension is available (this is a basic check)
   */
  static isExtensionAvailable(): boolean {
    // Simple check - in a real scenario you might want to use postMessage or other methods
    return true; // We'll assume extension might be available
  }
}

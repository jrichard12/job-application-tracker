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
      document.dispatchEvent(event);
      
      // Add a small delay to allow for processing
      await new Promise(resolve => setTimeout(resolve, 100)); 
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
}

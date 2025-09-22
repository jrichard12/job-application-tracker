import { ExtensionAuthService, type AuthTokens } from '../services/authService';

console.log('[Background Script] Initializing...');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Background Script] Received message:', message);

  if (message.action === 'storeAuthTokens') {
    handleStoreTokens(message.tokens)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[Background Script] Error storing tokens:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }

  if (message.action === 'clearAuthTokens') {
    console.log('[Background Script] Processing clearAuthTokens request');
    ExtensionAuthService.logout()
      .then(() => {
        console.log('[Background Script] Tokens cleared successfully');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[Background Script] Error clearing tokens:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }

  if (message.action === 'getAuthTokens') {
    ExtensionAuthService.getCurrentUser()
      .then((user) => {
        sendResponse({ success: true, tokens: user });
      })
      .catch((error: any) => {
        console.error('[Background Script] Error getting tokens:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

async function handleStoreTokens(tokensData: any) {
  try {
    // Transform the tokens data to match our interface
    const tokens: AuthTokens = {
      idToken: tokensData.idToken,
      accessToken: tokensData.accessToken || tokensData.idToken, // Use idToken as fallback
      refreshToken: tokensData.refreshToken || '',
      userId: tokensData.userId,
      username: tokensData.username,
      expiresAt: tokensData.expiresAt || (Date.now() + (24 * 60 * 60 * 1000)) // Default to 24 hours if not provided
    };

    await ExtensionAuthService.saveAuthTokens(tokens);
    console.log('[Background Script] Tokens stored successfully');
  } catch (error) {
    console.error('[Background Script] Error in handleStoreTokens:', error);
    throw error;
  }
}

// Handle extension startup - check if we have stored tokens
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background Script] Extension startup');
  const isAuth = await ExtensionAuthService.isAuthenticated();
  console.log('[Background Script] User authenticated:', isAuth);
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background Script] Extension installed/updated');
});

export {}; 

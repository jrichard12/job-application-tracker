import { triggerJobExtraction, isExtractionSupported, getJobSiteName } from '../utils/extractionUtils'

console.log('[Content Script] Loaded on:', window.location.href);
console.log('[Content Script] Origin:', window.location.origin);
console.log('[Content Script] Hostname:', window.location.hostname);

// Add a marker to the page so we can verify the content script is loaded
if (typeof window !== 'undefined') {
  (window as any).__JOB_TRACKER_EXTENSION_LOADED__ = true;
  console.log('[Content Script] Extension marker set');
}

// Listen for auth tokens from web app
document.addEventListener('auth-tokens-updated', async (event: any) => {
  console.log('[Content Script] Received auth tokens from web app:', event.detail);
  console.log('[Content Script] Current URL:', window.location.href);
  console.log('[Content Script] Event detail:', event.detail);
  
  try {
    // Send tokens to background script or handle directly
    console.log('[Content Script] Sending tokens to background script...');
    chrome.runtime.sendMessage({
      action: 'storeAuthTokens',
      tokens: event.detail
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Content Script] Error sending tokens to background:', chrome.runtime.lastError);
      } else {
        console.log('[Content Script] Tokens sent to background script successfully, response:', response);
      }
    });
  } catch (error) {
    console.error('[Content Script] Error handling auth tokens:', error);
  }
});

// Listen for token clearing from web app
document.addEventListener('auth-tokens-cleared', async () => {
  console.log('[Content Script] Received token clear request from web app');
  
  try {
    chrome.runtime.sendMessage({
      action: 'clearAuthTokens'
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('[Content Script] Error sending clear request to background:', chrome.runtime.lastError);
      } else {
        console.log('[Content Script] Clear request sent to background script successfully');
      }
    });
  } catch (error) {
    console.error('[Content Script] Error handling token clear:', error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Content Script] Received message:', message);
  
  // Handle ping to check if content script is available
  if (message.action === 'ping') {
    console.log('[Content Script] Ping received, responding...');
    sendResponse({ success: true, available: true });
    return true;
  }
  
  if (message.action === 'extractJobData') {
    try {
      const currentUrl = window.location.href;
      console.log('[Content Script] Current URL:', currentUrl);
      
      // Check if extraction is supported for this site
      if (!isExtractionSupported()) {
        console.log('[Content Script] Extraction not supported for this URL');
        sendResponse({ 
          success: false, 
          error: 'This job site is not supported for extraction yet.' 
        });
        return;
      }
      
      // Extract job data
      console.log('[Content Script] Starting job extraction...');
      const result = triggerJobExtraction();
      
      if (result.success) {
        console.log('[Content Script] Job data extracted successfully:', result.jobApp);
        sendResponse({ 
          success: true, 
          data: result.jobApp 
        });
      } else {
        console.log('[Content Script] Extraction failed:', result.errors);
        sendResponse({ 
          success: false, 
          error: result.errors.length > 0 ? result.errors.join(', ') : 'Could not extract job information from this page.' 
        });
      }
    } catch (error) {
      console.error('[Content Script] Error during extraction:', error);
      sendResponse({ 
        success: false, 
        error: 'An error occurred while extracting job data.' 
      });
    }
  }
  
  if (message.action === 'checkExtractionSupport') {
    const currentUrl = window.location.href;
    const isSupported = isExtractionSupported();
    const siteName = getJobSiteName();
    console.log('[Content Script] Extraction support check:', { url: currentUrl, isSupported, siteName });
    sendResponse({ 
      success: true, 
      isSupported, 
      siteName,
      url: currentUrl 
    });
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});

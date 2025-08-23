import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'
import { triggerJobExtraction, isExtractionSupported, getJobSiteName } from '../utils/extractionUtils'

// This is where any scripts should go. 
console.log('[CRXJS] Hello world from content script!')

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Content Script] Received message:', message);
  
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

// scripts end here. 

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

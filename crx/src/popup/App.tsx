import CreatePage from '@/components/CreatePage/CreatePage';
import HomePage from '@/components/HomePage/HomePage';
import type { MessageType } from '@/components/MessagePage/MessagePage';
import MessagePage from '@/components/MessagePage/MessagePage';
import { MessageTemplates } from '@/components/MessagePage/messageTemplates';
import { EXTENSION_CONFIG } from '@/config/config';
import { ExtensionAuthService } from '@/services/authService';
import { JobApp } from '@/types/JobApp';
import { useEffect, useState } from 'react';
import './App.scss';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageData, setMessageData] = useState<{
    type: MessageType;
    title: string;
    message: string;
  }>(MessageTemplates.EXTRACTION_NOT_SUPPORTED);
  const [extractedJobApp, setExtractedJobApp] = useState<JobApp | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{username: string; userId: string} | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Also check auth status when popup becomes visible (if supported)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const checkAuthStatus = async () => {
    console.log('[Popup] Checking authentication status...');
    setIsCheckingAuth(true);
    try {
      const authenticated = await ExtensionAuthService.isAuthenticated();
      console.log('[Popup] Authentication status:', authenticated);
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const user = await ExtensionAuthService.getCurrentUser();
        console.log('[Popup] Current user:', user);
        if (user) {
          setCurrentUser({ username: user.username, userId: user.userId });
        }
      } else {
        setCurrentUser(null);
        console.log('[Popup] No user authenticated');
      }
    } catch (error) {
      console.error('[Popup] Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleRefreshAuth = async () => {
    console.log('Refreshing authentication status...');
    await checkAuthStatus();
  };

  const handleManualLogout = async () => {
    console.log('[Popup] Manual logout initiated...');
    setIsCheckingAuth(true);
    try {
      await ExtensionAuthService.logout();
      console.log('[Popup] Manual logout completed');
      await checkAuthStatus();
    } catch (error) {
      console.error('[Popup] Error during manual logout:', error);
      setIsCheckingAuth(false);
    }
  };

  const handleGoToLogin = () => {
    console.log('[Popup] Opening login page...');
    chrome.tabs.create({ url: EXTENSION_CONFIG.LOGIN_URL });
  };

  const handleExtractJobData = async () => {
    console.log('🎯 Extract job data button clicked!');
    setIsLoading(true);
    
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🎯 Current tab:', tab);
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      // Check if content script is available by trying to ping it
      console.log('🎯 Checking if content script is available...');
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        console.log('🎯 Content script is available');
      } catch (pingError) {
        console.error('🎯 Content script not available:', pingError);
        
        // Try to inject the content script manually
        console.log('🎯 Attempting to inject content script manually...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/main.js']
          });
          
          // Wait a moment for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to ping again
          await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          console.log('🎯 Content script manually injected and available');
        } catch (injectionError) {
          console.error('🎯 Failed to inject content script:', injectionError);
          setMessageData({
            type: 'error',
            title: 'Extension Not Ready',
            message: 'The extension content script is not loaded on this page. Please refresh the page after logging in and try again. If the problem persists, this website may not be supported for job extraction.'
          });
          setShowMessage(true);
          setIsLoading(false);
          return;
        }
      }
      
      // First check if extraction is supported
      console.log('🎯 Checking extraction support via content script...');
      const supportResponse = await chrome.tabs.sendMessage(tab.id, { 
        action: 'checkExtractionSupport' 
      });
      
      console.log('🎯 Support check response:', supportResponse);
      
      if (!supportResponse.success) {
        throw new Error('Failed to check extraction support');
      }
      
      if (!supportResponse.isSupported) {
        console.log('🎯 Current site is not supported for extraction');
        setMessageData(MessageTemplates.EXTRACTION_NOT_SUPPORTED);
        setShowMessage(true);
        setIsLoading(false);
        return;
      }
      
      // Extract job data from the content script
      console.log('🎯 Requesting job extraction via content script...');
      const extractionResponse = await chrome.tabs.sendMessage(tab.id, { 
        action: 'extractJobData' 
      });
      
      console.log('🎯 Extraction response:', extractionResponse);
      
      if (!extractionResponse.success) {
        console.log('🎯 Extraction failed:', extractionResponse.error);
        setMessageData(MessageTemplates.EXTRACTION_FAILED);
        setShowMessage(true);
        setIsLoading(false);
        return;
      }
      
      const jobApp = extractionResponse.data;
      
      // Check if we got meaningful data (at least company and job title)
      const hasMinimalData = jobApp.company.trim() !== '' && jobApp.jobTitle.trim() !== '';
      
      if (!hasMinimalData) {
        console.log('🎯 No meaningful job data found');
        setMessageData(MessageTemplates.NO_JOB_DATA_FOUND);
        setShowMessage(true);
        setIsLoading(false);
        return;
      }
      
      // Success - we have data to show in the modal
      console.log('🎯 Successfully extracted job data:', jobApp);
      setExtractedJobApp(jobApp);
      setShowModal(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Unexpected error during extraction:', error);
      setMessageData(MessageTemplates.UNKNOWN_ERROR);
      setShowMessage(true);
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    console.log('Modal closed (Cancel clicked)');
    setShowModal(false);
    setExtractedJobApp(null); // Clear extracted data when modal closes
  };

  const handleManualEntry = () => {
    console.log('🎯 Manual entry button clicked!');
    setExtractedJobApp(null); // Ensure no extracted data is used
    setShowModal(true);
  };

  const handleCreateApp = (jobApp: JobApp) => {
    console.log('Job application saved successfully:', jobApp);
    setShowModal(false);
    setExtractedJobApp(null); // Clear extracted data when app is created
    
    // Show success message to user
    setMessageData({
      type: 'success',
      title: 'Job Application Saved!',
      message: `Your application for ${jobApp.jobTitle} at ${jobApp.company} has been saved successfully.`
    });
    setShowMessage(true);
  };

  const handleBackToHome = () => {
    console.log('Back to home clicked');
    setShowMessage(false);
  };

  return (
    <div className="app-container">
      {isCheckingAuth ? (
        // Show loading state while checking authentication
        <div className="auth-loading">
          <div className="loading-spinner">🔄</div>
          <p>Checking authentication...</p>
        </div>
      ) : !isAuthenticated ? (
        // Show login required message when not authenticated
        <MessagePage
          title={MessageTemplates.LOGIN_REQUIRED.title}
          message={MessageTemplates.LOGIN_REQUIRED.message}
          type={MessageTemplates.LOGIN_REQUIRED.type}
          actions={[
            {
              text: "Go to Login",
              onClick: handleGoToLogin,
              variant: "primary"
            },
            {
              text: "Refresh",
              onClick: handleRefreshAuth,
              variant: "secondary"
            }
          ]}
        />
      ) : showMessage ? (
        // Show other messages (extraction errors, etc.)
        <MessagePage
          title={messageData.title}
          message={messageData.message}
          type={messageData.type}
          onBack={handleBackToHome}
        />
      ) : (
        // Show main functionality when authenticated
        <>
          {/* Authentication Status */}
          <div className="auth-status">
            <div className="auth-success">
              ✅ Logged in as {currentUser?.username}
              <button className="refresh-btn" onClick={handleRefreshAuth} title="Refresh auth status">
                🔄
              </button>
              <button className="logout-btn" onClick={handleManualLogout} title="Logout from extension">
                🚪
              </button>
            </div>
          </div>
          
          <HomePage 
            onExtractJobData={handleExtractJobData}
            onManualEntry={handleManualEntry}
            isLoading={isLoading}
            currentUser={currentUser}
          />
          
          <CreatePage 
            isOpen={showModal}
            handleClose={handleCloseModal}
            handleCreateApp={handleCreateApp}
            initialData={extractedJobApp || undefined}
          />
        </>
      )}
    </div>
  );
}

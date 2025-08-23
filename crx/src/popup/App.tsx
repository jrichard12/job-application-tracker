import { useState } from 'react';
import HomePage from '@/components/HomePage/HomePage';
import CreatePage from '@/components/CreatePage/CreatePage';
import MessagePage from '@/components/MessagePage/MessagePage';
import { MessageTemplates } from '@/components/MessagePage/messageTemplates';
import { JobApp } from '@/types/JobApp';
import type { MessageType } from '@/components/MessagePage/MessagePage';
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

  const handleExtractJobData = async () => {
    console.log('🎯 Extract job data button clicked!');
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🎯 Current tab:', tab);
      
      if (!tab.id) {
        throw new Error('No active tab found');
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
    console.log('Save clicked - Job app data:', jobApp);
    setShowModal(false);
    setExtractedJobApp(null); // Clear extracted data when app is created
  };

  const handleBackToHome = () => {
    console.log('Back to home clicked');
    setShowMessage(false);
  };

  return (
    <div className="app-container">
      {showMessage ? (
        <MessagePage
          title={messageData.title}
          message={messageData.message}
          type={messageData.type}
          onBack={handleBackToHome}
        />
      ) : (
        <>
          <HomePage 
            onExtractJobData={handleExtractJobData}
            onManualEntry={handleManualEntry}
            isLoading={isLoading}
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

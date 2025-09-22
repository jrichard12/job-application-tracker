import { MessageType } from './MessagePage';

// Predefined messages for common scenarios
export const MessageTemplates = {
  // Extraction-related messages
  EXTRACTION_NOT_SUPPORTED: {
    type: 'warning' as MessageType,
    title: 'Site Not Supported',
    message: 'This website is not currently supported for automatic job data extraction. You can still add job applications manually.',
  },

  EXTRACTION_FAILED: {
    type: 'error' as MessageType,
    title: 'Extraction Failed',
    message: 'We were unable to extract job data from this page. The page structure may have changed or there may be an issue with the website.',
  },

  NO_JOB_DATA_FOUND: {
    type: 'info' as MessageType,
    title: 'No Job Data Found',
    message: 'We couldn\'t find any job information on this page. Make sure you\'re on a job posting page and try again.',
  },

  // Save-related messages
  SAVE_FAILED: {
    type: 'error' as MessageType,
    title: 'Save Failed',
    message: 'There was an error saving your job application. Please check your connection and try again.',
  },

  SAVE_SUCCESS: {
    type: 'success' as MessageType,
    title: 'Application Saved',
    message: 'Your job application has been successfully saved to your tracker!',
  },

  // Network-related messages
  NETWORK_ERROR: {
    type: 'error' as MessageType,
    title: 'Connection Error',
    message: 'Unable to connect to the job tracker service. Please check your internet connection and try again.',
  },

  // General error
  UNKNOWN_ERROR: {
    type: 'error' as MessageType,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again, and if the problem persists, contact support.',
  },

  // Authentication-related messages
  LOGIN_REQUIRED: {
    type: 'warning' as MessageType,
    title: 'Login Required',
    message: 'Please log in to access the App Tracker features.\n\n• Click "Go to Login" to open the web app\n• Log in with your credentials\n• Return here and click "Refresh" to continue',
  },

  AUTH_EXPIRED: {
    type: 'warning' as MessageType,
    title: 'Session Expired',
    message: 'Your login session has expired. Please log in to the web app again to continue using the extension.',
  },
} as const;

// Helper function to create custom messages
export const createMessage = (
  title: string, 
  message: string, 
  type: MessageType = 'info'
) => ({
  type,
  title,
  message,
});

// Helper function to get message for extraction errors
export const getExtractionErrorMessage = (isSupported: boolean, hasData: boolean) => {
  if (!isSupported) {
    return MessageTemplates.EXTRACTION_NOT_SUPPORTED;
  }
  
  if (!hasData) {
    return MessageTemplates.NO_JOB_DATA_FOUND;
  }
  
  return MessageTemplates.EXTRACTION_FAILED;
};

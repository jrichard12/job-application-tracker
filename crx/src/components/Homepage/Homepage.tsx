import React from 'react';
import './HomePage.scss';

interface HomePageProps {
  onExtractJobData: () => void;
  onManualEntry: () => void;
  isLoading: boolean;
  currentUser?: {
    username: string;
    userId: string;
  } | null;
}

const HomePage: React.FC<HomePageProps> = ({ onExtractJobData, onManualEntry, isLoading, currentUser }) => {
  if (isLoading) {
    return (
      <div className="homepage">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Extracting Job Data...</h2>
          <p className="loading-message">
            Please wait while we analyze the job posting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Job Tracker</h1>
          <p className="welcome-message">
            Streamline your job application process with our smart data extraction tool.
          </p>
        </div>
        
        <div className="action-section">
          <button 
            className="extract-button"
            onClick={onExtractJobData}
          >
            Extract Job Data
          </button>
          
          <div className="button-divider">
            <span>or</span>
          </div>
          
          <button 
            className="manual-button"
            onClick={onManualEntry}
          >
            Manual Entry
          </button>
        </div>
      </div>
      
      {currentUser && (
        <div className="user-status">
          <span className="user-indicator">
            👤 Logged in as {currentUser.username.length > 25 
              ? currentUser.username.split('@')[0] + (currentUser.username.includes('@') ? '...' : '') 
              : currentUser.username}
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;

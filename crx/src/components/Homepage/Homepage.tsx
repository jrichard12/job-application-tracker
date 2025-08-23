import React from 'react';
import './Homepage.scss';

interface HomepageProps {
  onExtractJobData: () => void;
  isLoading: boolean;
}

const Homepage: React.FC<HomepageProps> = ({ onExtractJobData, isLoading }) => {
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
      </div>
    </div>
  );
};

export default Homepage;

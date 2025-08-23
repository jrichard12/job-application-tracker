import { useState } from 'react';
import Homepage from '@/components/Homepage/Homepage';
import CreateAppModal from '@/components/CreateAppModal/CreateAppModal';
import { JobApp } from '@/types/JobApp';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleExtractJobData = async () => {
    console.log('Extract job data button clicked!');
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate loading time (replace with actual extraction logic later)
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 1500);
  };

  const handleCloseModal = () => {
    console.log('Modal closed (Cancel clicked)');
    setShowModal(false);
  };

  const handleCreateApp = (jobApp: JobApp) => {
    console.log('Save clicked - Job app data:', jobApp);
    setShowModal(false);
  };

  return (
    <div>
      <Homepage 
        onExtractJobData={handleExtractJobData}
        isLoading={isLoading}
      />
      
      <CreateAppModal 
        isOpen={showModal}
        handleClose={handleCloseModal}
        handleCreateApp={handleCreateApp}
      />
    </div>
  );
}

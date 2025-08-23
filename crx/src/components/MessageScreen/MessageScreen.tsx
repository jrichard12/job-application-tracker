import React from 'react';
import './MessageScreen.scss';

export type MessageType = 'error' | 'warning' | 'info' | 'success';

interface MessageScreenProps {
  title: string;
  message: string;
  type: MessageType;
  onBack: () => void;
  backButtonText?: string;
}

const MessageScreen: React.FC<MessageScreenProps> = ({ 
  title, 
  message, 
  type, 
  onBack, 
  backButtonText = 'Back to Home' 
}) => {
  const getIcon = (messageType: MessageType) => {
    switch (messageType) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="message-screen">
      <div className="message-content">
        <div className={`message-icon ${type}`}>
          {getIcon(type)}
        </div>
        
        <h1 className="message-title">{title}</h1>
        
        <p className="message-text">{message}</p>
      </div>
      
      <div className="action-section">
        <button 
          className="back-button"
          onClick={onBack}
        >
          {backButtonText}
        </button>
      </div>
    </div>
  );
};

export default MessageScreen;

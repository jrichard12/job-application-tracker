import React from 'react';
import './MessagePage.scss';

export type MessageType = 'error' | 'warning' | 'info' | 'success';

interface ActionButton {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface MessagePageProps {
  title: string;
  message: string;
  type: MessageType;
  onBack?: () => void;
  backButtonText?: string;
  actions?: ActionButton[];
}

const MessagePage: React.FC<MessagePageProps> = ({ 
  title, 
  message, 
  type, 
  onBack, 
  backButtonText = 'Back to Home',
  actions
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
        {actions && actions.length > 0 ? (
          actions.map((action, index) => (
            <button 
              key={index}
              className={`action-button ${action.variant || 'secondary'}`}
              onClick={action.onClick}
            >
              {action.text}
            </button>
          ))
        ) : onBack ? (
          <button 
            className="back-button"
            onClick={onBack}
          >
            {backButtonText}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default MessagePage;

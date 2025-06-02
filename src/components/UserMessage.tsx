import React from 'react';

// Define the Message interface (can be moved to a shared types file later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
}

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div
      key={message.id}
      className="message-appear"
      style={{
        alignSelf: 'flex-end',
        maxWidth: '75%',
        marginBottom: '12px', // Matches the gap in ChatInterface
      }}
    >
      <div
        style={{
          backgroundColor: '#00FF87', // whoopGreen // User message background
          color: '#111111', // whoopBlack // User message text color
          padding: '10px 15px',
          borderRadius: '18px 18px 5px 18px', // User message border radius
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          wordWrap: 'break-word',
        }}
      >
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>
      </div>
      <small style={{ fontSize: '0.75rem', color: '#777', display: 'block', marginTop: '5px', textAlign: 'right' }}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </small>
    </div>
  );
};

export default UserMessage;

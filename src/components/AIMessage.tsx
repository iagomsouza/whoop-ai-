import React from 'react';

// Define the Message interface (can be moved to a shared types file later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
}

interface AIMessageProps {
  message: Message;
}

const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  return (
    <div
      key={message.id}
      className="message-appear"
      style={{
        alignSelf: 'flex-start',
        maxWidth: '75%',
        marginBottom: '12px', // Matches the gap in ChatInterface
      }}
    >
      <div
        style={{
          backgroundColor: '#2B2B2B', // whoopDarkGray
          color: '#FFFFFF', // whoopWhite
          padding: '10px 15px',
          borderRadius: '18px 18px 18px 5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          wordWrap: 'break-word',
        }}
      >
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>
      </div>
      <small style={{ fontSize: '0.75rem', color: '#A0A0A0', display: 'block', marginTop: '5px', textAlign: 'left' }}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </small>
    </div>
  );
};

export default AIMessage;

import React from 'react';

interface MessageInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
}) => {
  return (
    <div style={{ display: 'flex', padding: '15px', borderTop: '1px solid #404040', backgroundColor: '#111111' }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={onKeyPress}
        style={{
          flexGrow: 1,
          padding: '12px 15px',
          borderRadius: '20px',
          border: '1px solid #404040',
          backgroundColor: '#2B2B2B',
          color: '#FFFFFF',
          marginRight: '10px',
          fontSize: '1em',
        }}
        placeholder="Ask WHOOP Coach for wellness advice..."
      />
      <button
        onClick={onSendMessage}
        style={{
          padding: '12px 25px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: '#00FF87', // whoopGreen
          color: '#111111', // whoopBlack
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'background-color 0.2s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#00E678')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#00FF87')}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;

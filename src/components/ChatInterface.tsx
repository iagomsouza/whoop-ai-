import React, { useState, useEffect, useRef } from 'react';

// Basic message structure
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' could be for error messages or context
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null); // For auto-scrolling

  // Function to scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages change
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // --- Placeholder for AI Response ---
    // TODO: Replace this with an actual API call to your backend service
    // that uses the modules we built in Epic 2.
    // For now, we'll simulate a delay and an echo response.
    setTimeout(() => {
      const aiResponse: Message = {
        id: `${Date.now()}-ai`,
        text: `I received: "${currentInput}". (This is a placeholder response. Real AI integration is next!)`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1200);
    // --- End Placeholder ---
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', maxWidth: '800px', margin: '20px auto', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
      {/* Header (Optional) */}
      <div style={{ padding: '15px 20px', backgroundColor: '#007bff', color: 'white', borderBottom: '1px solid #0056b3', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.4em' }}>WHOOP AI Coach</h2>
      </div>

      {/* Messages Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
            }}
          >
            <div
              style={{
                background: msg.sender === 'user' ? '#007bff' : (msg.sender === 'ai' ? '#ffffff' : '#f0f0f0'),
                color: msg.sender === 'user' ? 'white' : '#333333',
                padding: '10px 15px',
                borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                wordWrap: 'break-word',
                border: msg.sender === 'ai' ? '1px solid #e0e0e0' : 'none',
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
            <small style={{ fontSize: '0.75rem', color: '#777', display: 'block', marginTop: '5px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          style={{
            flexGrow: 1,
            padding: '12px 15px',
            borderRadius: '25px',
            border: '1px solid #ccc',
            marginRight: '10px',
            fontSize: '1em',
          }}
          placeholder="Ask Alex for wellness advice..."
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '12px 25px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useEffect, useRef } from 'react';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import MessageInput from './MessageInput';

import QuickActionButtons from './QuickActionButtons';
import UserProfileHeader from './UserProfileHeader';
import MetricsDashboard from './MetricsDashboard';

// Basic message structure
// Key Metrics for UserProfileHeader
interface MetricDetail {
  value?: string;
  status?: 'good' | 'neutral' | 'poor';
  trend?: 'up' | 'down' | 'flat';
}

interface KeyMetrics {
  hrv?: MetricDetail;
  recovery?: MetricDetail;
  sleep?: MetricDetail;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' could be for error messages or context
  timestamp: Date;
}

const staticStarters = [
  "Ready for a weekly review?",
  "Any workout suggestions for today?",
  "What are some general wellness tips?"
];

const getDynamicStarters = (metrics: KeyMetrics): string[] => {
  const suggestions: string[] = [];
  if (metrics.recovery?.status === 'poor') {
    suggestions.push("My recovery is low. What should I focus on today?");
  }
  if (metrics.sleep?.status === 'poor' && suggestions.length < 2) {
    suggestions.push("I didn't sleep well. How will that affect my day?");
  }
  if (metrics.hrv?.trend === 'down' && suggestions.length < 2) {
    suggestions.push("My HRV trended down. What could be the cause?");
  }
  if (suggestions.length < 2 && metrics.recovery?.status === 'good' && metrics.recovery?.trend === 'up') {
    suggestions.push("Recovery is up! How can I make the most of it?");
  }
  if (suggestions.length < 2 && metrics.hrv?.trend === 'up' && metrics.hrv?.status !== 'poor') {
     suggestions.push("HRV is trending up! What does this mean?");
  }
  return suggestions.slice(0, 2); // Max 2 dynamic suggestions
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null); // For auto-scrolling

  // Function to scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages change
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = typeof messageText === 'string' ? messageText : inputValue.trim();
    if (textToSend === '') return; // Don't send empty messages

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Clear input only if it wasn't a direct query send (from quick actions)
    if (typeof messageText !== 'string') {
      setInputValue('');
    }
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.reply;

      if (!aiText) {
        throw new Error('No reply found in the server response.');
      }

      const aiResponse: Message = {
        id: `${Date.now()}-ai`,
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response from proxy:", error);
      const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error trying to respond. Please try again.';
      const errorResponse: Message = {
        id: `${Date.now()}-error-ai`,
        text: errorMessage,
        sender: 'ai', // Or 'system' if preferred for errors
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    }
    setIsAiTyping(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuerySelect = (query: string) => {
    handleSendMessage(query);
  };

  const executiveAlexMetrics: KeyMetrics = {
    hrv: { value: '68 ms', status: 'neutral', trend: 'down' },
    recovery: { value: '75%', status: 'good', trend: 'up' },
    sleep: { value: '7h 15m', status: 'good', trend: 'flat' },
  };

  const dynamicGeneratedStarters = getDynamicStarters(executiveAlexMetrics);
  const currentStarters = Array.from(new Set([...dynamicGeneratedStarters, ...staticStarters])).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', maxWidth: '800px', margin: '20px auto', border: '1px solid #404040', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', overflow: 'hidden', backgroundColor: '#1F1F1F' }}>
      <UserProfileHeader personaName="Alex, welcome to Whoop Coach" personaRole="Busy Professional" avatarInitials="EA" metrics={executiveAlexMetrics} />
      <MetricsDashboard metrics={executiveAlexMetrics} />

      {/* Messages Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return <UserMessage key={msg.id} message={msg} />;
          } else if (msg.sender === 'ai' || msg.sender === 'system') {
            return <AIMessage key={msg.id} message={msg} />;
          }
          return null;
        })}
        {isAiTyping && (
          <AIMessage
            message={{
              id: 'typing-indicator',
              text: 'WHOOP Coach is typing...',
              sender: 'system',
              timestamp: new Date(),
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
      <QuickActionButtons
        queries={currentStarters}
        onQuerySelect={handleQuickQuerySelect}
      />
    </div>
  );
};

export default ChatInterface;

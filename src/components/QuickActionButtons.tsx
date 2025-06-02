import React from 'react';

interface QuickActionButtonsProps {
  queries: string[];
  onQuerySelect: (query: string) => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ queries, onQuerySelect }) => {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#2B2B2B', // whoopDarkGray
    border: '1px solid #404040', // whoopLightGray
    borderRadius: '15px',
    padding: '10px 15px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    color: '#FFFFFF', // whoopWhite
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#404040', // whoopLightGray
    boxShadow: '0 0 8px rgba(0, 255, 135, 0.3)', // Subtle WHOOP green glow
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid #404040', backgroundColor: '#111111' }}>
      {queries.map((query) => (
        <button
          key={query}
          onClick={() => onQuerySelect(query)}
          style={buttonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor!;
            e.currentTarget.style.boxShadow = buttonHoverStyle.boxShadow!;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor!;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {query}
        </button>
      ))}
    </div>
  );
};

export default QuickActionButtons;

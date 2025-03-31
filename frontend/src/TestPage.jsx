import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1>CompliTracker Frontend is Working!</h1>
      <p>This is a test page to verify that the frontend is rendering correctly.</p>
      <div>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '10px'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestPage;

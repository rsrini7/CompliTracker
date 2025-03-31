import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TestPage from './TestPage.jsx';

import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;
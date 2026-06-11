import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';

function App() {
  const [entered, setEntered] = useState(false);

  return (
    <div className="app-container">
      {!entered ? (
        <WelcomeScreen onEnter={() => setEntered(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;

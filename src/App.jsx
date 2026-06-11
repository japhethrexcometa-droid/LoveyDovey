import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import FloatingHearts from './components/FloatingHearts';

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      <FloatingHearts />
      <AnimatePresence mode="wait">
        {!entered ? (
          <WelcomeScreen key="welcome" onEnter={() => setEntered(true)} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </>
  );
}

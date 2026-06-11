import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import FloatingHearts from './components/FloatingHearts';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('loveydovey-auth') === 'true'
  );
  const [entered, setEntered] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

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

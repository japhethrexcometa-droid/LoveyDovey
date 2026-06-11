import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Delete } from 'lucide-react';
import './LoginScreen.css';

const CORRECT_PIN = '03312025'; // User's anniversary/special date

export default function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 8) {
      if (pin === CORRECT_PIN) {
        localStorage.setItem('loveydovey-auth', 'true');
        setTimeout(() => onLogin(), 300);
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }, [pin, onLogin]);

  const handlePadClick = (num) => {
    if (pin.length < 8) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="login-screen">
      <div className="login-bg-hearts">
        {[...Array(15)].map((_, i) => (
          <span key={i} className="bg-heart" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${14 + Math.random() * 20}px`,
            opacity: 0.15 + Math.random() * 0.15,
          }}>💗</span>
        ))}
      </div>

      <motion.div 
        className="pin-container glass-panel"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-logo">
          <motion.div 
            className="logo-heart"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Heart size={40} fill="var(--secondary)" color="var(--secondary)" />
          </motion.div>
          <h1 className="login-title">LoveyDovey</h1>
          <p className="login-subtitle">Enter our secret passcode 💕</p>
        </div>

        <motion.div 
          className={`pin-dots ${error ? 'shake' : ''}`}
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ gap: '8px' }} // Tighter gap for 8 dots
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} style={{ width: '12px', height: '12px' }} />
          ))}
        </motion.div>

        <div className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} className="num-btn" onClick={() => handlePadClick(num.toString())}>
              {num}
            </button>
          ))}
          <div className="num-btn empty"></div>
          <button className="num-btn" onClick={() => handlePadClick('0')}>0</button>
          <button className="num-btn action" onClick={handleDelete}>
            <Delete size={24} />
          </button>
        </div>
        
        <div className="pin-hint">Hint: Our special date 💕 (03312025)</div>
      </motion.div>
    </div>
  );
}

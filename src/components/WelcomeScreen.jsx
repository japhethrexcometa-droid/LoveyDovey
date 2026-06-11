import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onEnter }) {
  return (
    <div className="welcome-container">
      <motion.div 
        className="welcome-content glass-panel"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <motion.img 
          src="/images/cute_dino_mascot.png" 
          alt="Cute Dino" 
          className="welcome-dino floating"
        />
        <motion.h1 
          className="welcome-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Rawr means I love you! 🦖
        </motion.h1>
        <motion.p 
          className="welcome-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A special place for you while we're apart...
        </motion.p>
        
        <motion.button 
          className="enter-button pulse"
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Heart size={20} fill="white" />
          <span>Tap to Enter</span>
          <Heart size={20} fill="white" />
        </motion.button>
      </motion.div>
    </div>
  );
}

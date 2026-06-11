import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Heart, Eye, EyeOff } from 'lucide-react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'loveydovey' && password === 'loveydovey') {
      localStorage.setItem('loveydovey-auth', 'true');
      onLogin();
    } else {
      setError('Wrong credentials, my love! Try again 💕');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-bg-hearts">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="bg-heart" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${14 + Math.random() * 20}px`,
            opacity: 0.15 + Math.random() * 0.15,
          }}>💗</span>
        ))}
      </div>

      <motion.div 
        className="login-card glass-panel"
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
          <p className="login-subtitle">This is our secret place 🦖💕</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input 
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
              autoCapitalize="off"
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
            <button 
              type="button" 
              className="eye-btn" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                className="login-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button 
            type="submit" 
            className={`login-btn ${shake ? 'shake' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Enter Our World 💗
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e=>{});
      
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const setBreak = () => {
    setIsActive(false);
    setIsBreak(true);
    setTimeLeft(5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div 
      className="tool-card glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="tool-header" style={{ justifyContent: 'center' }}>
        <div className="tool-title-group" style={{ textAlign: 'center' }}>
          <h2>{isBreak ? '☕ Farm Break Time' : '🚜 Deep Focus Mode'}</h2>
          <p>{isBreak ? 'Rest your hands. You did great!' : 'Focus on your agriculture report or study.'}</p>
        </div>
      </div>

      <div className="timer-display">
        <div className={`timer-circle ${isBreak ? 'break-mode' : 'focus-mode'} ${isActive ? 'pulse' : ''}`}>
          <span className="time">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button className="timer-btn primary" onClick={toggleTimer}>
          {isActive ? <Pause /> : <Play />} {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="timer-btn secondary" onClick={resetTimer}>
          <RotateCcw /> Reset
        </button>
        {!isBreak && (
          <button className="timer-btn break-btn" onClick={setBreak}>
            <Coffee /> Take Break
          </button>
        )}
      </div>
      
      <div className="timer-message">
        {isActive ? (
          isBreak ? "Relaxing..." : "Your handsome engineer is cheering for you! Focus!"
        ) : (
          "Ready when you are, my love."
        )}
      </div>
    </motion.div>
  );
}

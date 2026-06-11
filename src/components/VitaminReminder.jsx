import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, X } from 'lucide-react';
import './VitaminReminder.css';

export default function VitaminReminder() {
  const [time, setTime] = useState(localStorage.getItem('vitaminTime') || '08:00');
  const [saved, setSaved] = useState(false);
  const [isTime, setIsTime] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(null);

  useEffect(() => {
    // Check every second if it's time
    const interval = setInterval(() => {
      if (!time) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      
      // If it's the minute they set and we haven't alerted yet for this specific minute
      if (currentTime === time && lastAlertTime !== currentTime) {
        setIsTime(true);
        setLastAlertTime(currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [time, lastAlertTime]);

  const handleSave = () => {
    localStorage.setItem('vitaminTime', time);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDismiss = () => {
    setIsTime(false);
  };

  return (
    <div className="vitamin-container">
      
      <AnimatePresence>
        {isTime && (
          <motion.div 
            className="reminder-alert-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="reminder-alert glass-panel"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <img src="/images/cute_dino_vitamin.png" alt="Vitamin Dino" className="alert-dino pulse" />
              <h2>It's Vitamin Time! 💊</h2>
              <p>Don't forget to take your vitamins, my love!</p>
              <button className="dismiss-btn" onClick={handleDismiss}>
                <Check size={20} /> I took them!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="vitamin-card glass-panel">
        <div className="vitamin-header">
          <img src="/images/cute_dino_vitamin.png" alt="Vitamin Dino" className="header-dino floating" />
          <div className="header-text">
            <h3>Daily Vitamin Reminder</h3>
            <p>Set a time so I can remind you everyday!</p>
          </div>
        </div>

        <div className="time-setter">
          <div className="time-input-wrapper">
            <Clock className="time-icon" size={24} />
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input"
            />
          </div>
          
          <motion.button 
            className="save-btn"
            onClick={handleSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saved ? <><Check size={18} /> Saved!</> : <><Bell size={18} /> Set Reminder</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

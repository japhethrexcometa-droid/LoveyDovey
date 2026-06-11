import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarHeart } from 'lucide-react';
import './OJTCountdown.css';

export default function OJTCountdown() {
  // Target date: August 13, 2026 (2 months after she starts on June 13, 2026)
  const targetDate = new Date("2026-08-13T00:00:00").getTime();
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <motion.div 
      className="countdown-card glass-panel"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="countdown-header">
        <CalendarHeart color="var(--primary)" size={24} />
        <h3>See You Soon!</h3>
      </div>
      <p className="countdown-subtitle">Counting down the days until your OJT ends 💕</p>
      <div className="time-blocks">
        <div className="time-block">
          <span className="time-val">{timeLeft.days}</span>
          <span className="time-label">Days</span>
        </div>
        <div className="time-block">
          <span className="time-val">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="time-label">Hours</span>
        </div>
        <div className="time-block">
          <span className="time-val">{String(timeLeft.mins).padStart(2, '0')}</span>
          <span className="time-label">Mins</span>
        </div>
        <div className="time-block">
          <span className="time-val">{String(timeLeft.secs).padStart(2, '0')}</span>
          <span className="time-label">Secs</span>
        </div>
      </div>
    </motion.div>
  );
}

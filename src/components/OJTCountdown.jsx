import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarHeart, PartyPopper, Trophy, Flag, Rocket, Star } from 'lucide-react';
import './OJTCountdown.css';

// OJT Duration: June 16, 2026 → August 13, 2026 = ~58 days
const OJT_START = new Date("2026-06-16T00:00:00").getTime();
const OJT_END   = new Date("2026-08-13T00:00:00").getTime();
const TOTAL_DAYS = Math.ceil((OJT_END - OJT_START) / (1000 * 60 * 60 * 24));

const MILESTONES = [
  { at: 7,  label: 'Week 1 Done!', emoji: '🌱', icon: Rocket },
  { at: 14, label: '2 Weeks Strong!', emoji: '💪', icon: Star },
  { at: 21, label: '3 Weeks!', emoji: '🔥', icon: Flag },
  { at: Math.floor(TOTAL_DAYS / 2), label: 'Halfway There!', emoji: '🎯', icon: Trophy },
  { at: TOTAL_DAYS - 7, label: 'Last Week!', emoji: '🏁', icon: PartyPopper },
];

export default function OJTCountdown() {
  const getTargetDate = () => {
    const saved = localStorage.getItem('ojtTargetDate');
    return saved ? parseInt(saved) : OJT_END;
  };

  const calculateTimeLeft = () => {
    const target = getTargetDate();
    const now = new Date().getTime();
    const distance = target - now;

    if (distance < 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      secs: Math.floor((distance % (1000 * 60)) / 1000),
      done: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [showMilestoneConfetti, setShowMilestoneConfetti] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);

  const daysElapsed = Math.max(0, Math.ceil((Date.now() - OJT_START) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, (daysElapsed / TOTAL_DAYS) * 100);

  useEffect(() => {
    if (!localStorage.getItem('ojtTargetDate')) {
      localStorage.setItem('ojtTargetDate', OJT_END.toString());
    }
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check milestone celebrations
  useEffect(() => {
    const lastCelebrated = localStorage.getItem('lastMilestone');
    const hit = MILESTONES.find(m => daysElapsed >= m.at);
    if (hit && lastCelebrated !== hit.label) {
      setCurrentMilestone(hit);
      setShowMilestoneConfetti(true);
      localStorage.setItem('lastMilestone', hit.label);
      setTimeout(() => setShowMilestoneConfetti(false), 3500);
    }
  }, [daysElapsed]);

  // Day 0 celebration: full screen confetti
  if (timeLeft.done) {
    return (
      <motion.div
        className="countdown-celebration"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="celebration-confetti">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-piece"
              style={{ 
                backgroundColor: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6b9d','#c084fc'][i % 6],
                left: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ 
                y: [0, -150 - Math.random() * 200, 600],
                x: (Math.random() - 0.5) * 300,
                rotate: Math.random() * 720,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 2.5 + Math.random() * 1.5, 
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeOut' 
              }}
            />
          ))}
        </div>
        <motion.div 
          className="celebration-content"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <span className="celebration-dino">🦕</span>
          <h1>You Made It!</h1>
          <p>I'm so proud of you, my love! 💕</p>
          <p className="celebration-sub">Your OJT journey is complete. Time to celebrate together!</p>
        </motion.div>
      </motion.div>
    );
  }

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

      {/* Milestone Progress Bar */}
      <div className="milestone-section">
        <div className="progress-bar-track">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {MILESTONES.map(m => {
            const pos = (m.at / TOTAL_DAYS) * 100;
            const reached = daysElapsed >= m.at;
            return (
              <div 
                key={m.label}
                className={`milestone-marker ${reached ? 'reached' : ''}`}
                style={{ left: `${pos}%` }}
                title={m.label}
              >
                <span className="marker-emoji">{m.emoji}</span>
              </div>
            );
          })}
        </div>
        <div className="progress-label">
          <span>Day {Math.min(daysElapsed, TOTAL_DAYS)} of {TOTAL_DAYS}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Milestone confetti burst */}
      <AnimatePresence>
        {showMilestoneConfetti && currentMilestone && (
          <motion.div
            className="milestone-toast"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>{currentMilestone.emoji}</span> {currentMilestone.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

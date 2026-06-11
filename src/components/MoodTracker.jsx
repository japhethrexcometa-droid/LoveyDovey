import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { saveMood, getMoods } from '../utils/db';
import './MoodTracker.css';

const MOODS = [
  { emoji: '😢', label: 'Sad', color: '#ffb3ba', score: 1 },
  { emoji: '😕', label: 'Stressed', color: '#ffdfba', score: 2 },
  { emoji: '😐', label: 'Okay', color: '#ffffba', score: 3 },
  { emoji: '🙂', label: 'Good', color: '#baffc9', score: 4 },
  { emoji: '🥰', label: 'Happy', color: '#bae1ff', score: 5 },
];

export default function MoodTracker() {
  const [history, setHistory] = useState({});
  const [selectedToday, setSelectedToday] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const getTodayStr = () => {
    const today = new Date();
    // Use local time for date string
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    const data = await getMoods();
    const historyMap = {};
    data.forEach(item => {
      historyMap[item.date] = item.mood;
    });
    setHistory(historyMap);
    
    if (historyMap[getTodayStr()]) {
      setSelectedToday(historyMap[getTodayStr()]);
    }
  };

  const handleMoodSelect = async (mood) => {
    const todayStr = getTodayStr();
    await saveMood(todayStr, mood);
    setSelectedToday(mood);
    setHistory(prev => ({ ...prev, [todayStr]: mood }));
    
    if (mood.score >= 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Generate last 30 days for heatmap
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    // Let's generate 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  };

  const days = getHeatmapDays();

  return (
    <motion.div 
      className="mood-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="mood-card glass-panel">
        <div className="mood-header">
          <h2>Daily Mood Check-in 🌸</h2>
          <p>How are you feeling about your OJT today?</p>
        </div>

        <div className="mood-selector">
          {MOODS.map((mood) => {
            const isSelected = selectedToday && selectedToday.label === mood.label;
            return (
              <motion.button
                key={mood.label}
                className={`mood-btn ${isSelected ? 'selected' : ''}`}
                style={{ '--mood-color': mood.color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(mood)}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
                {isSelected && (
                  <motion.div 
                    layoutId="outline" 
                    className="mood-outline" 
                    initial={false} 
                    animate={{ borderColor: mood.color }} 
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="heatmap-section">
          <h3>Your Mood History</h3>
          <div className="heatmap-grid">
            {days.map((dateStr) => {
              const recordedMood = history[dateStr];
              const d = new Date(dateStr);
              return (
                <div 
                  key={dateStr} 
                  className="heatmap-cell"
                  style={{ backgroundColor: recordedMood ? recordedMood.color : 'var(--glass-bg)' }}
                  title={`${d.toLocaleDateString()}: ${recordedMood ? recordedMood.label : 'No entry'}`}
                >
                  {recordedMood && <span className="cell-emoji">{recordedMood.emoji}</span>}
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span>Older</span>
            <div className="legend-gradient"></div>
            <span>Today</span>
          </div>
        </div>

        {showConfetti && (
          <div className="mood-confetti">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="confetti-piece"
                initial={{ 
                  x: 0, y: 0, 
                  backgroundColor: ['#ffb3ba', '#baffc9', '#bae1ff'][Math.floor(Math.random() * 3)] 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 300, 
                  y: -200 - Math.random() * 200,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

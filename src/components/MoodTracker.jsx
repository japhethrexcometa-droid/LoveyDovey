import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMood, getMoods } from '../utils/db';
import { supabase } from '../lib/supabaseClient';
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
  const [selectedToday, setSelectedToday] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('loveydovey-user-role'));

  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (userRole) {
      loadMoods();
      
      // Setup Realtime Sync
      if (supabase) {
        const channel = supabase
          .channel('moods_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'moods' }, payload => {
            console.log('Realtime mood update:', payload);
            loadMoods(); // Reload on any change
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [userRole]);

  const loadMoods = async () => {
    const data = await getMoods();
    const historyMap = {};
    data.forEach(item => {
      if (item.mood && item.mood.emoji) {
        historyMap[item.date] = { legacy: item.mood };
      } else {
        historyMap[item.date] = item.mood || {};
      }
    });
    setHistory(historyMap);
    
    if (historyMap[getTodayStr()]) {
      setSelectedToday(historyMap[getTodayStr()]);
    }
  };

  const handleMoodSelect = async (mood) => {
    if (!userRole) return;
    const todayStr = getTodayStr();
    
    // Optimistic update
    const newSelectedToday = { ...selectedToday, [userRole]: mood };
    setSelectedToday(newSelectedToday);
    setHistory(prev => ({ ...prev, [todayStr]: newSelectedToday }));
    
    await saveMood(todayStr, mood, userRole);
    
    if (mood.score >= 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleRoleSelect = (role) => {
    localStorage.setItem('loveydovey-user-role', role);
    setUserRole(role);
  };

  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  };

  const days = getHeatmapDays();
  const partnerRole = userRole === 'mio' ? 'sole' : 'mio';

  if (!userRole) {
    return (
      <motion.div className="mood-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mood-card glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Who is using this device? 💕</h2>
          <p style={{ marginBottom: '30px' }}>To sync your moods correctly, let me know who you are!</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button className="letter-btn" onClick={() => handleRoleSelect('mio')}>
              🦖 Mio
            </button>
            <button className="letter-btn" onClick={() => handleRoleSelect('sole')}>
              🌸 Sole
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
          <p>How are you feeling today?</p>
        </div>

        <div className="mood-selector">
          {MOODS.map((mood) => {
            const isSelected = selectedToday[userRole] && selectedToday[userRole].label === mood.label;
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

        {/* Partner's Mood Section */}
        {selectedToday[partnerRole] && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="partner-mood-banner"
          >
            <p>{partnerRole === 'mio' ? 'Mio' : 'Sole'} is feeling <strong>{selectedToday[partnerRole].label}</strong> today {selectedToday[partnerRole].emoji}</p>
          </motion.div>
        )}

        <div className="heatmap-section">
          <h3>Our Mood History</h3>
          <div className="heatmap-grid">
            {days.map((dateStr) => {
              const dayMoods = history[dateStr] || {};
              const himMood = dayMoods.mio || dayMoods.legacy;
              const herMood = dayMoods.sole;
              
              const d = new Date(dateStr);
              
              return (
                <div 
                  key={dateStr} 
                  className="heatmap-cell dual-cell"
                  style={{ backgroundColor: 'var(--glass-bg)' }}
                  title={`${d.toLocaleDateString()}`}
                >
                  <div className="half-cell" style={{ backgroundColor: himMood ? himMood.color : 'transparent' }}>
                    {himMood && <span className="cell-emoji-small">{himMood.emoji}</span>}
                  </div>
                  <div className="half-cell" style={{ backgroundColor: herMood ? herMood.color : 'transparent' }}>
                    {herMood && <span className="cell-emoji-small">{herMood.emoji}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span>Older</span>
            <div className="legend-gradient"></div>
            <span>Today</span>
          </div>
          <div className="heatmap-legend" style={{ justifyContent: 'center', marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
            <span>(Left: Mio 🦖, Right: Sole 🌸)</span>
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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, CalendarPlus } from 'lucide-react';
import './VitaminReminder.css';

export default function VitaminReminder() {
  const [time, setTime] = useState(localStorage.getItem('vitaminTime') || '08:00');
  const [saved, setSaved] = useState(false);
  const [isTime, setIsTime] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!time) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const currentSeconds = now.getSeconds();
      
      // Trigger exactly on the 0th second of the chosen minute
      if (currentTime === time && currentSeconds === 0 && lastAlertTime !== currentTime) {
        triggerAlarm();
        setLastAlertTime(currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [time, lastAlertTime]);

  const triggerAlarm = () => {
    setIsTime(true);
    
    // Play loud alarm sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log("Audio autoplay prevented by browser", e));
      audioRef.current = audio;
    } catch(e) {}

    // Show system notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💊 It's Vitamin Time!", {
        body: "Don't forget to take your vitamins, my love!",
        icon: "/images/cute_dino_vitamin.png"
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem('vitaminTime', time);
    setSaved(true);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDismiss = () => {
    setIsTime(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSyncCalendar = () => {
    const [hours, minutes] = time.split(':');
    const now = new Date();
    now.setHours(parseInt(hours), parseInt(minutes), 0);
    
    // Convert to UTC strings for ICS format
    const startUtc = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endNow = new Date(now.getTime() + 15 * 60000); // 15 mins later
    const endUtc = endNow.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//For My Love//Vitamin Reminder//EN
BEGIN:VEVENT
UID:${new Date().getTime()}@formylove.app
DTSTAMP:${startUtc}
DTSTART:${startUtc}
DTEND:${endUtc}
RRULE:FREQ=DAILY
SUMMARY:💊 Vitamin Time!
DESCRIPTION:Take your vitamins, my love! I love you! 🦖
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:AUDIO
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Vitamin_Reminder.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            <motion.button 
              className="save-btn"
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ flex: 1, minWidth: '120px' }}
            >
              {saved ? <><Check size={18} /> Saved!</> : <><Bell size={18} /> Set Time</>}
            </motion.button>
            
            <motion.button 
              className="sync-btn"
              onClick={handleSyncCalendar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: 1, minWidth: '160px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '50px',
                border: 'none', background: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <CalendarPlus size={18} /> Sync to Phone
            </motion.button>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '15px', fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>
          <strong>💡 Want a real alarm that wakes you up?</strong><br/>
          Since this is a website, it can only make sound when it is open. 
          Click <strong>Sync to Phone</strong> to add an alarm directly to your device's calendar app so it rings loud even when you are studying or the app is completely closed!
        </div>
      </div>
    </div>
  );
}

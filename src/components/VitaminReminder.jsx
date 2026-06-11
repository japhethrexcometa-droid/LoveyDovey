import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, CalendarPlus, CheckCircle } from 'lucide-react';
import './VitaminReminder.css';

export default function VitaminReminder() {
  const [time, setTime] = useState(localStorage.getItem('vitaminTime') || '08:00');
  const [saved, setSaved] = useState(false);
  const [isTime, setIsTime] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const [toast, setToast] = useState(null);
  const audioRef = useRef(null);
  const nativeInputRef = useRef(null);

  useEffect(() => {
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
      
      if (currentTime === time && currentSeconds === 0 && lastAlertTime !== currentTime) {
        triggerAlarm();
        setLastAlertTime(currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [time, lastAlertTime]);

  const triggerAlarm = () => {
    setIsTime(true);
    
    try {
      const audio = new Audio('/alarm-audio.webm');
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(audio);
      
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 4.0;

      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      audio.play().catch(e => console.log("Audio autoplay prevented by browser", e));
      audioRef.current = audio;
    } catch(e) {
      console.log("Web Audio API failed, using standard audio", e);
      const fallbackAudio = new Audio('/alarm-audio.webm');
      fallbackAudio.loop = true;
      fallbackAudio.volume = 1.0;
      fallbackAudio.play().catch(e => console.log("Audio autoplay prevented", e));
      audioRef.current = fallbackAudio;
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Alarm ${formatTime12hr(time)} Wake up`, {
        body: "Vitamin time! Tap to stop.",
        icon: "/images/cute_dino_vitamin.png"
      });
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    localStorage.setItem('vitaminTime', time);
    setSaved(true);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    showToast(`✅ Reminder set for ${formatTime12hr(time)} every day!`);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDismiss = () => {
    setIsTime(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hours = parseInt(h, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${m} ${suffix}`;
  };

  const handleTimeDisplayClick = () => {
    if (nativeInputRef.current) {
      nativeInputRef.current.showPicker?.();
      nativeInputRef.current.click();
      nativeInputRef.current.focus();
    }
  };

  const handleSyncCalendar = () => {
    const [hours, minutes] = time.split(':');
    const now = new Date();
    now.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const startUtc = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endNow = new Date(now.getTime() + 15 * 60000);
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

    showToast("📅 Calendar file downloaded! Open it to add the daily reminder to your phone.");
  };

  return (
    <div className="vitamin-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="vitamin-toast"
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <CheckCircle size={18} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTime && (
          <motion.div 
            className="reminder-alert-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="android-alarm-popup"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              <div className="android-alarm-header">
                <Clock size={16} fill="#5f6368" color="white" />
                <span>Clock</span>
              </div>
              <div className="android-alarm-title">
                Alarm {formatTime12hr(time)} Wake up
              </div>
              <div className="android-alarm-buttons">
                <button className="android-btn snooze-btn" onClick={handleDismiss}>Snooze</button>
                <button className="android-btn stop-btn" onClick={handleDismiss}>Stop</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="vitamin-card glass-panel">
        <div className="vitamin-header">
          <img 
            src="/images/cute_dino_vitamin.png" 
            alt="Cute dinosaur holding vitamins — a daily reminder from your handsome LoveyDovey" 
            className="header-dino floating" 
          />
          <div className="header-text">
            <h3>Daily Vitamin Reminder</h3>
            <p>Set a time so I can remind you everyday!</p>
          </div>
        </div>

        <div className="time-setter">
          <div className="time-input-wrapper" onClick={handleTimeDisplayClick} role="button" tabIndex={0} aria-label="Click to change reminder time">
            <Clock className="time-icon" size={24} />
            <span className="time-display">{formatTime12hr(time)}</span>
            {/* Hidden native input — always works on every device */}
            <input 
              ref={nativeInputRef}
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input-native"
              aria-label="Select vitamin reminder time"
            />
          </div>
          
          <div className="vitamin-actions">
            <motion.button 
              className="save-btn"
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saved ? <><Check size={18} /> Saved!</> : <><Bell size={18} /> Set Time</>}
            </motion.button>
            
            <motion.button 
              className="sync-btn"
              onClick={handleSyncCalendar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CalendarPlus size={18} /> Add to Calendar
            </motion.button>
          </div>
        </div>
        
        <div className="vitamin-tip">
          <strong>💡 Want a real alarm that wakes you up?</strong><br/>
          Since this is a website, it can only make sound when it is open. 
          Click <strong>Add to Calendar</strong> to download an .ics file — open it and your phone will add a repeating daily alarm that rings even when the app is closed!
        </div>
      </div>
    </div>
  );
}

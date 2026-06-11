import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import './MusicPlayer.css';

const SONG_NOTE = "This is our song because every time I hear it, I think of you. No matter how far apart we are, I'm always here with you. 🦖💕";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Auto-play prevented by browser. User must interact first.");
          });
      }
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-wrapper">
      <AnimatePresence>
        {showNote && (
          <motion.div 
            className="song-note glass-panel"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
          >
            <Heart size={14} fill="#ff6b6b" color="#ff6b6b" />
            <p>{SONG_NOTE}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="music-player glass-panel"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <audio 
          ref={audioRef} 
          src="/mp3/d4vd - Here With Me (Lyrics).mp3" 
          loop 
        />
        
        <div className="music-info">
          <div className={`music-icon ${isPlaying ? 'spin' : ''}`}>
            <Music size={20} color="var(--primary)" />
          </div>
          <div className="music-text">
            <span className="song-title">Here With Me</span>
            <span className="artist">d4vd</span>
          </div>
        </div>

        <div className="music-actions">
          <button 
            className={`note-toggle-btn ${showNote ? 'active' : ''}`} 
            onClick={() => setShowNote(!showNote)}
            title="Song dedication"
          >
            <Heart size={14} fill={showNote ? "#ff6b6b" : "none"} color={showNote ? "#ff6b6b" : "currentColor"} />
          </button>
          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music } from 'lucide-react';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt to auto-play when the component mounts
    // Note: browsers might block this without user interaction, which is why
    // we also have the play button and the Welcome screen interaction.
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Set volume to 50%
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Auto-play was prevented by browser, that's okay
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
    <motion.div 
      className="music-player glass-panel"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
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

      <button className="play-btn" onClick={togglePlay}>
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from './PhotoGallery';
import VitaminReminder from './VitaminReminder';
import MusicPlayer from './MusicPlayer';
import OJTCountdown from './OJTCountdown';
import LoveLetter from './LoveLetter';
import { Image, Pill } from 'lucide-react';
import imagesData from '../images.json';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Randomize images so it looks fresh every time!
    const shuffled = [...imagesData].sort(() => 0.5 - Math.random());
    setImages(shuffled);
  }, []);

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="dashboard-header glass-panel">
        <div className="dashboard-title">For My Love 🦖</div>
        
        <div className="header-actions">
          <LoveLetter />
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              <Image size={18} /> Our Memories
            </button>
            <button 
              className={`tab-btn ${activeTab === 'vitamins' ? 'active' : ''}`}
              onClick={() => setActiveTab('vitamins')}
            >
              <Pill size={18} /> Vitamins
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' ? (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OJTCountdown />
              <PhotoGallery images={images} />
            </motion.div>
          ) : (
            <motion.div 
              key="vitamins"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VitaminReminder />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MusicPlayer />
    </motion.div>
  );
}

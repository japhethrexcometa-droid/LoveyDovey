import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from './PhotoGallery';
import VitaminReminder from './VitaminReminder';
import MusicPlayer from './MusicPlayer';
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
      transition={{ duration: 1 }}
    >
      <MusicPlayer />
      
      <header className="dashboard-header glass-panel">
        <h2 className="dashboard-title">For My Love 🦖</h2>
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
      </header>

      <main className="dashboard-main">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="tab-content"
            >
              <PhotoGallery images={images} />
            </motion.div>
          ) : (
            <motion.div
              key="vitamins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="tab-content"
            >
              <VitaminReminder />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

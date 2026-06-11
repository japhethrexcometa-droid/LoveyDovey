import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from './PhotoGallery';
import VitaminReminder from './VitaminReminder';
import MusicPlayer from './MusicPlayer';
import OJTCountdown from './OJTCountdown';
import LoveLetter from './LoveLetter';
import OJTTools from './ojt/OJTTools';
import { Image, Pill, Briefcase, Menu, X } from 'lucide-react';
import imagesData from '../images.json';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [images, setImages] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <AnimatePresence>
            <motion.div 
              className={`tab-navigation ${isMobileMenuOpen ? 'mobile-open' : ''}`}
            >
              <button 
                className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => { setActiveTab('gallery'); setIsMobileMenuOpen(false); }}
              >
                <Image size={18} /> Our Memories
              </button>
              <button 
                className={`tab-btn ${activeTab === 'vitamins' ? 'active' : ''}`}
                onClick={() => { setActiveTab('vitamins'); setIsMobileMenuOpen(false); }}
              >
                <Pill size={18} /> Vitamins
              </button>
              <button 
                className={`tab-btn ${activeTab === 'ojt' ? 'active' : ''}`}
                onClick={() => { setActiveTab('ojt'); setIsMobileMenuOpen(false); }}
              >
                <Briefcase size={18} /> OJT Tools
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </header>

      <main className="dashboard-content">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OJTCountdown />
              <PhotoGallery images={images} />
            </motion.div>
          )}
          {activeTab === 'vitamins' && (
            <motion.div 
              key="vitamins"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VitaminReminder />
            </motion.div>
          )}
          {activeTab === 'ojt' && (
            <motion.div 
              key="ojt"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OJTTools />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MusicPlayer />
    </motion.div>
  );
}

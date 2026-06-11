import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from './PhotoGallery';
import VitaminReminder from './VitaminReminder';
import MusicPlayer from './MusicPlayer';
import OJTCountdown from './OJTCountdown';
import LoveLetter from './LoveLetter';
import OJTTools from './ojt/OJTTools';
import MoodTracker from './MoodTracker';
import { Image, Pill, Briefcase, Menu, X, HeartHandshake } from 'lucide-react';
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

  const TABS = [
    { id: 'gallery', icon: Image, label: 'Memories' },
    { id: 'vitamins', icon: Pill, label: 'Vitamins' },
    { id: 'mood', icon: HeartHandshake, label: 'Mood' },
    { id: 'ojt', icon: Briefcase, label: 'Tools' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false); // Close menu on select
  };

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
        </div>
      </header>

      {/* Desktop/Tablet Nav & Mobile Drawer Menu */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth > 640) && (
          <motion.div 
            className={`tab-navigation ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
            initial={{ opacity: window.innerWidth <= 640 ? 0 : 1, y: window.innerWidth <= 640 ? -20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: window.innerWidth <= 640 ? 0 : 1, y: window.innerWidth <= 640 ? -20 : 0 }}
          >
            {TABS.map(tab => (
              <button 
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
              >
                <tab.icon size={20} /> 
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
          {activeTab === 'mood' && (
            <motion.div 
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MoodTracker />
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

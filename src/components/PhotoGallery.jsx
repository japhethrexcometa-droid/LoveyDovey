import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2 } from 'lucide-react';
import { savePhoto, getPhotos, deletePhoto } from '../utils/db';
import './PhotoGallery.css';

export default function PhotoGallery({ images }) {
  const [selectedId, setSelectedId] = useState(null);
  const [dbPhotos, setDbPhotos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDbPhotos();
  }, []);

  const loadDbPhotos = async () => {
    try {
      const photos = await getPhotos();
      setDbPhotos(photos || []);
    } catch (e) {
      console.error("Failed to load local photos", e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      await savePhoto(base64String, '');
      await loadDbPhotos();
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDbPhoto = async (id, e) => {
    e.stopPropagation();
    await deletePhoto(id);
    setSelectedId(null);
    await loadDbPhotos();
  };

  const allItems = [
    // Database photos first
    ...dbPhotos.map(p => ({ isDb: true, id: p.id, src: p.data })),
    // Then original JSON images
    ...(images || []).map(img => ({ isDb: false, id: img, src: `/images/${img}` }))
  ];

  if (allItems.length === 0) {
    return (
      <div className="empty-gallery glass-panel">
        <p>No memories found yet... Let's make some! 💕</p>
        <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
          <Upload size={18} /> Upload Photo
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
          <Upload size={18} /> Add Memory
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
      </div>

      <div className="masonry-grid">
        {allItems.map((item, index) => (
          <motion.div
            key={item.id}
            layoutId={String(item.id)}
            className="gallery-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            onClick={() => setSelectedId(item)}
          >
            <img src={item.src} alt="Memory" loading="lazy" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <button className="lightbox-close">
              <X size={24} color="white" />
            </button>
            <motion.div 
              className="lightbox-content"
              layoutId={String(selectedId.id)}
            >
              <img src={selectedId.src} alt="Expanded Memory" />
              {selectedId.isDb && (
                <button 
                  className="delete-photo-btn"
                  onClick={(e) => handleDeleteDbPhoto(selectedId.id, e)}
                >
                  <Trash2 size={20} /> Delete
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

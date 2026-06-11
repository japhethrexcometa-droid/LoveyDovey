import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './PhotoGallery.css';

export default function PhotoGallery({ images }) {
  const [selectedId, setSelectedId] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="empty-gallery glass-panel">
        <p>No memories found yet... Let's make some! 💕</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="masonry-grid">
        {images.map((img, index) => (
          <motion.div
            key={img}
            layoutId={img}
            className="gallery-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            onClick={() => setSelectedId(img)}
          >
            <img src={`/images/${img}`} alt={`Memory ${index + 1}`} loading="lazy" />
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
            <button className="lightbox-close" onClick={() => setSelectedId(null)}>
              <X size={24} color="white" />
            </button>
            <motion.div 
              className="lightbox-content"
              layoutId={selectedId}
            >
              <img src={`/images/${selectedId}`} alt="Expanded Memory" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

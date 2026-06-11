import React from 'react';
import { motion } from 'framer-motion';
import './PhotoGallery.css';

export default function PhotoGallery({ images }) {
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
            key={index}
            className="gallery-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
          >
            <img src={`/images/${img}`} alt={`Memory ${index + 1}`} loading="lazy" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

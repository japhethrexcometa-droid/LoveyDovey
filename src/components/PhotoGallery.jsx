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

    // Subscribe to realtime database changes for live syncing!
    let subscription;
    import('../lib/supabaseClient').then(({ supabase }) => {
      if (supabase) {
        subscription = supabase
          .channel('photos-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
            console.log("Realtime photo change received!", payload);
            loadDbPhotos(); // Reload when new photo drops
          })
          .subscribe();
      }
    });

    return () => {
      if (subscription) {
        import('../lib/supabaseClient').then(({ supabase }) => {
          if (supabase) supabase.removeChannel(subscription);
        });
      }
    };
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
      const caption = prompt("Enter a sweet caption for this memory 💕:") || "A beautiful moment together";
      await savePhoto(file, base64String, caption);
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
    ...dbPhotos.map(p => {
      const d = new Date(p.date);
      const dateStr = !isNaN(d) ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return { isDb: true, id: p.id, src: p.data, caption: p.caption, date: dateStr };
    }),
    // Then original JSON images
    ...(images || []).map(img => {
      // Create a fake date/caption for hardcoded images
      const niceName = img.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
      return { isDb: false, id: img, src: `/images/${img}`, caption: niceName, date: 'Our Past Memories' };
    })
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
            <img src={item.src} alt={item.caption || "Memory"} loading="lazy" />
            <div className="gallery-caption">
              <strong>{item.caption}</strong>
              {item.date && <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>{item.date}</div>}
            </div>
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

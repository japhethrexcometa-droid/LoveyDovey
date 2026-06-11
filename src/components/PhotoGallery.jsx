import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Calendar, Edit3 } from 'lucide-react';
import { savePhoto, getPhotos, deletePhoto } from '../utils/db';
import './PhotoGallery.css';

export default function PhotoGallery({ images }) {
  const [selectedId, setSelectedId] = useState(null);
  const [dbPhotos, setDbPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Upload Modal State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadDate, setUploadDate] = useState('');

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
      setUploadFile(file);
      setUploadCaption('');
      setUploadDate(new Date().toISOString().split('T')[0]); // Default to today
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadPreview) return;

    await savePhoto(uploadFile, uploadPreview, uploadCaption || "A beautiful moment together", uploadDate);
    
    // Reset and close modal
    setUploadFile(null);
    setUploadPreview(null);
    setUploadCaption('');
    setUploadDate('');
    await loadDbPhotos();
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

  return (
    <div className="gallery-container">
      {allItems.length === 0 ? (
        <div className="empty-gallery glass-panel">
          <p>No memories found yet... Let's make some! 💕</p>
          <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <Upload size={18} /> Upload Photo
          </button>
        </div>
      ) : (
        <>
          <div className="gallery-header">
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
              <Upload size={18} /> Add Memory
            </button>
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
        </>
      )}

      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelect} 
      />

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadPreview && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="upload-modal-content glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button 
                className="upload-close" 
                onClick={() => { setUploadPreview(null); setUploadFile(null); }}
              >
                <X size={20} />
              </button>
              
              <h2>Add a Memory 📸</h2>
              
              <div className="upload-preview-container">
                <img src={uploadPreview} alt="Preview" />
              </div>

              <form onSubmit={handleUploadSubmit} className="upload-form">
                <div className="input-group">
                  <label><Edit3 size={16} /> Caption</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Our first date at the beach 🏖️"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label><Calendar size={16} /> Date of Memory</label>
                  <input 
                    type="date" 
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="upload-submit-btn">
                  <Upload size={18} /> Save Memory
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedId && !uploadPreview && (
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
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedId.src} alt="Expanded Memory" />
              
              <div className="lightbox-caption-bar">
                <div className="lightbox-caption-text">
                  <h3>{selectedId.caption}</h3>
                  <p>{selectedId.date}</p>
                </div>
                {selectedId.isDb && (
                  <button 
                    className="delete-photo-btn lightbox-delete"
                    onClick={(e) => handleDeleteDbPhoto(selectedId.id, e)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

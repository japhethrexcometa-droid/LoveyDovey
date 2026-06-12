import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Heart, X, Lock, Unlock, Plus } from 'lucide-react';
import { saveCapsule, getCapsules, deleteCapsule } from '../utils/db';
import './LoveLetter.css';

export default function LoveLetter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  
  // Author Mode
  const [tapCount, setTapCount] = useState(0);
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  
  // New Capsule Form
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newUnlockDate, setNewUnlockDate] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      loadCapsules();
      setTapCount(0); // Reset taps on open
    }
  }, [isModalOpen]);

  const loadCapsules = async () => {
    const data = await getCapsules();
    // Default hardcoded letter if none exist yet
    if (data.length === 0) {
      const defaultCapsule = {
        id: 'default',
        title: 'Read Me First',
        message: 'Even though you are away for your 2 months of OJT, I want you to know how much I love you and how proud I am of you.\n\nI built this little system so that whenever you miss me, you can look at our memories, listen to our favorite song or my favorite song for you, and remember to take your vitamins!\n\nI will be waiting for you. Take care of yourself always!',
        unlockDate: new Date().toISOString(), // Unlocked now
        createdAt: new Date().toISOString()
      };
      await saveCapsule(defaultCapsule);
      setCapsules([defaultCapsule]);
    } else {
      setCapsules(data.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate)));
    }
  };

  const handleTitleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setIsAuthorMode(true);
      setTapCount(0);
    }
  };

  const handleAddCapsule = async (e) => {
    e.preventDefault();
    if (!newTitle || !newMessage || !newUnlockDate) return;
    
    await saveCapsule({
      id: Date.now().toString(),
      title: newTitle,
      message: newMessage,
      unlockDate: new Date(newUnlockDate).toISOString(),
      createdAt: new Date().toISOString()
    });
    
    setNewTitle('');
    setNewMessage('');
    setNewUnlockDate('');
    setIsAuthorMode(false);
    loadCapsules();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this capsule?")) {
      await deleteCapsule(id);
      loadCapsules();
    }
  };

  const openCapsule = (capsule) => {
    const unlockTime = new Date(capsule.unlockDate).getTime();
    if (Date.now() >= unlockTime || isAuthorMode) {
      setSelectedCapsule(capsule);
    } else {
      alert(`This capsule is locked until ${new Date(capsule.unlockDate).toLocaleDateString()}! 🔒`);
    }
  };

  return (
    <>
      <motion.button 
        className="letter-btn glass-panel"
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Mail size={20} color="var(--primary)" />
        <span>Open Me!</span>
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="letter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsModalOpen(false); setSelectedCapsule(null); setIsAuthorMode(false); }}
          >
            <motion.div 
              className={`letter-modal ${selectedCapsule ? 'reading-mode' : 'list-mode'}`}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="letter-close" 
                onClick={() => {
                  if (selectedCapsule) setSelectedCapsule(null);
                  else if (isAuthorMode) setIsAuthorMode(false);
                  else setIsModalOpen(false);
                }}
              >
                <X size={20} />
              </button>

              {/* READING MODE */}
              {selectedCapsule ? (
                <div className="letter-content">
                  <Heart className="letter-icon pulse" size={32} color="#ff6b6b" fill="#ff6b6b" />
                  <h2>{selectedCapsule.title}</h2>
                  <div className="letter-body">
                    {selectedCapsule.message.split('\n').map((para, i) => (
                      <p key={i}>{para || <br />}</p>
                    ))}
                  </div>
                  <p className="letter-signature">- Your handsome LoveyDovey 🦖</p>
                </div>
              ) : isAuthorMode ? (
                /* AUTHOR MODE (SECRET) */
                <div className="author-mode">
                  <h2>Write a Time Capsule 🤫</h2>
                  <form onSubmit={handleAddCapsule} className="author-form">
                    <input 
                      type="text" 
                      placeholder="Title (e.g. For our Anniversary)" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      required
                    />
                    <textarea 
                      placeholder="Write your sweet message here..." 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      required
                    />
                    <div className="date-picker-row">
                      <label>Unlock Date:</label>
                      <input 
                        type="date" 
                        value={newUnlockDate}
                        onChange={e => setNewUnlockDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="save-capsule-btn">
                      Seal Capsule <Lock size={16} />
                    </button>
                  </form>
                </div>
              ) : (
                /* CAPSULE LIST MODE */
                <div className="capsule-list-view">
                  <h2 onClick={handleTitleTap} className="capsules-title">
                    Time Capsules <Heart size={20} fill="var(--primary)" color="var(--primary)" />
                  </h2>
                  <p className="capsules-subtitle">Messages waiting for the perfect moment.</p>
                  
                  <div className="capsules-grid">
                    {capsules.map(capsule => {
                      const unlockTime = new Date(capsule.unlockDate).getTime();
                      const isLocked = Date.now() < unlockTime;
                      return (
                        <motion.div 
                          key={capsule.id}
                          className={`capsule-item ${isLocked ? 'locked' : 'unlocked'}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openCapsule(capsule)}
                        >
                          <div className="capsule-icon">
                            {isLocked ? <Lock size={24} color="#a0aec0" /> : <Unlock size={24} color="#ff6b6b" />}
                          </div>
                          <div className="capsule-info">
                            <h4>{capsule.title}</h4>
                            <p>{isLocked ? `Locked until ${new Date(capsule.unlockDate).toLocaleDateString()}` : 'Ready to read!'}</p>
                          </div>
                          {/* Only show delete in author mode to prevent accidental deletion by her */}
                          {isAuthorMode && (
                            <button className="capsule-delete" onClick={(e) => handleDelete(e, capsule.id)}>
                              <X size={16} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

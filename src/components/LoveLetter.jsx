import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Heart, X } from 'lucide-react';
import './LoveLetter.css';

export default function LoveLetter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button 
        className="letter-btn glass-panel"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Mail size={20} color="var(--primary)" />
        <span>Open Me!</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="letter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              className="letter-content"
              initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="letter-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
              <Heart className="letter-icon pulse" size={32} color="#ff6b6b" fill="#ff6b6b" />
              <h2>To My Love,</h2>
              <div className="letter-body">
                <p>Even though you are away for your 2 months of OJT, I want you to know how much I love you and how proud I am of you.</p>
                <p>I built this little system so that whenever you miss me, you can look at our memories, listen to our favorite song or my favorite song for you, and remember to take your vitamins!</p>
                <p>I will be waiting for you. Take care of yourself always!</p>
              </div>
              <p className="letter-signature">- Your handsome engineer 🦖</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

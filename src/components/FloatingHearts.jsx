import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './FloatingHearts.css';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Generate hearts based on screen size
    let numHearts = 10;
    if (window.innerWidth <= 640) {
      numHearts = 3;
    } else if (window.innerWidth <= 1024) {
      numHearts = 5;
    }

    const newHearts = Array.from({ length: numHearts }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random start X position
      delay: Math.random() * 10, // random animation delay
      duration: 15 + Math.random() * 20, // random animation duration
      size: 15 + Math.random() * 25 // random size between 15px and 40px
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="floating-hearts-container">
      {hearts.map(heart => (
        <motion.div
          key={heart.id}
          className="heart"
          initial={{ y: "110vh", x: `${heart.x}vw`, opacity: 0 }}
          animate={{ 
            y: "-10vh", 
            x: [`${heart.x}vw`, `${heart.x + (Math.random() * 10 - 5)}vw`, `${heart.x}vw`],
            opacity: [0, 0.8, 0] 
          }}
          transition={{ 
            duration: heart.duration, 
            repeat: Infinity, 
            delay: heart.delay,
            ease: "linear"
          }}
          style={{ width: heart.size, height: heart.size }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingHearts() {
  const hearts = Array.from({ length: 5 }); // Reduced to 5 to save mobile CPU

  return (
    <div className="floating-hearts-container">
      {hearts.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 10 + Math.random() * 10;
        const scale = 0.5 + Math.random() * 1;
        
        return (
          <motion.div
            key={i}
            className="heart"
            style={{ willChange: "transform" }}
            initial={{ y: "110vh", x: `${left}vw`, opacity: 0.8, scale }}
            animate={{ y: "-10vh", opacity: 0 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
          >
            💖
          </motion.div>
        );
      })}
    </div>
  );
}

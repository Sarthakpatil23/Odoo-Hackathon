import React from 'react';
import { motion } from 'motion/react';

export function Aurora({ className }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      <motion.div
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-10%", "10%", "-10%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-[0.15] blur-[100px]"
        style={{
          background: "radial-gradient(circle, oklch(var(--primary)) 0%, transparent 40%)"
        }}
      />
      <motion.div
        animate={{
          x: ["20%", "-20%", "20%"],
          y: ["10%", "-10%", "10%"],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity,
        }}
        className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] opacity-[0.15] blur-[100px]"
        style={{
          background: "radial-gradient(circle, oklch(var(--pop)) 0%, transparent 40%)"
        }}
      />
    </div>
  );
}

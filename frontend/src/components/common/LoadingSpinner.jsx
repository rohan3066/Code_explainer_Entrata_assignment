import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

export default function LoadingSpinner({ message = "Authenticating secure session..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center h-20 w-20 mb-6">
        {/* Pulsing glow background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
        />

        {/* Outer rotating ring */}
        <svg className="w-full h-full animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
          <circle
            className="text-muted/20"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <circle
            className="text-primary"
            strokeWidth="4"
            strokeDasharray="200"
            strokeDashoffset="100"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
        </svg>

        {/* Central Icon */}
        <div className="absolute text-primary">
          <Code2 className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm font-extrabold text-muted-foreground tracking-tight text-center max-w-xs"
      >
        {message}
      </motion.p>
    </div>
  );
}

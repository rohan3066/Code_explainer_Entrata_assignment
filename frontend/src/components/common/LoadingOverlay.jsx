import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Sparkles, Cpu, ShieldAlert, Zap } from 'lucide-react';

const LOADING_STEPS = [
  { icon: Code2, text: 'Scanning code structure...' },
  { icon: Cpu, text: 'Analyzing algorithm complexity (Big O)...' },
  { icon: Sparkles, text: 'Generating natural language explanation...' },
  { icon: ShieldAlert, text: 'Checking security patterns & vulnerabilities...' },
  { icon: Zap, text: 'Optimizing code path and recommending improvements...' },
];

export default function LoadingOverlay({ 
  isVisible, 
  title = "Analyzing Codebase", 
  subtitle = "Our AI engine is processing your code. This may take a few seconds." 
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const StepIcon = LOADING_STEPS[currentStepIdx].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md p-6"
      >
        <div className="max-w-md w-full text-center space-y-8">
          {/* Animated Glowing Loader Icon */}
          <div className="relative flex items-center justify-center mx-auto h-28 w-28">
            {/* Pulsing Outer Ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.25, 1],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            />
            {/* Spinning Border Loader */}
            <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
              <circle
                className="text-muted/20"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <motion.circle
                className="text-primary"
                strokeWidth="4"
                strokeDasharray="250"
                strokeDashoffset="120"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                animate={{
                  strokeDashoffset: [240, 60, 240],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
            
            {/* Central Icon container */}
            <div className="absolute inset-4 rounded-full bg-card border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIdx}
                  initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.4 }}
                  className="text-primary"
                >
                  <StepIcon className="h-8 w-8" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="text-sm font-semibold text-muted-foreground">{subtitle}</p>
          </div>

          {/* Progress indicator */}
          <div className="bg-card border rounded-2xl p-4 max-w-sm mx-auto shadow-sm flex items-center gap-4">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="text-left overflow-hidden">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Current Action</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStepIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-bold text-foreground truncate"
                >
                  {LOADING_STEPS[currentStepIdx].text}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

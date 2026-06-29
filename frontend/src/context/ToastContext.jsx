import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let Icon = Info;
            let themeClass = 'bg-card border text-foreground';
            let iconColor = 'text-primary';

            if (toast.type === 'success') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-500';
              themeClass = 'bg-card border-emerald-500/20 dark:border-emerald-500/10 text-foreground';
            } else if (toast.type === 'error') {
              Icon = AlertCircle;
              iconColor = 'text-destructive';
              themeClass = 'bg-card border-destructive/20 dark:border-destructive/10 text-foreground';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-500';
              themeClass = 'bg-card border-amber-500/20 dark:border-amber-500/10 text-foreground';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border pointer-events-auto ${themeClass}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
                <div className="flex-1 text-sm font-semibold pr-2 leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-0.5 hover:bg-muted transition duration-150"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

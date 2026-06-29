import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay || 0 }}
      className="p-6 rounded-2xl bg-card border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-primary/5 text-primary border border-primary/10 shadow-inner`}>
        <Icon className="h-6 w-6" />
      </div>
    </motion.div>
  );
}

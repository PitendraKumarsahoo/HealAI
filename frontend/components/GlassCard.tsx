import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, translateY: -5 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={`
        backdrop-blur-xl 
        bg-white/70 dark:bg-slate-800/40 
        border border-slate-200/50 dark:border-slate-700/50 
        shadow-xl dark:shadow-slate-900/20
        rounded-3xl 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

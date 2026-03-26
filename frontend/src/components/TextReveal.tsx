import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("inline-block", className)}
    >
      {text}
    </motion.span>
  );
};

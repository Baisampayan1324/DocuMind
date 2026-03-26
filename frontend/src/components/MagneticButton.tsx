import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  to?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, to }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);
  const transform = useMotionTemplate`translate(${dx}px, ${dy}px)`;

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ transform }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );

  return to ? <a href={to}>{content}</a> : content;
};

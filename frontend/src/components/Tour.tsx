import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTour } from '../context/TourContext';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const Tour: React.FC = () => {
  const { isTourOpen, currentStep, steps, nextStep, prevStep, stopTour } = useTour();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (isTourOpen) {
      const step = steps[currentStep];
      const element = document.getElementById(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isTourOpen, currentStep, steps]);

  if (!isTourOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Backdrop with hole */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={stopTour} />
      
      {/* Highlight Box */}
      <motion.div
        initial={false}
        animate={{
          top: coords.top - 8,
          left: coords.left - 8,
          width: coords.width + 16,
          height: coords.height + 16,
        }}
        className="absolute border-2 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] z-[201] pointer-events-none"
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          top: step.position === 'right' ? coords.top : coords.top + coords.height + 20,
          left: step.position === 'right' ? coords.left + coords.width + 24 : coords.left,
        }}
        className="absolute z-[202] w-80 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-2xl pointer-events-auto"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Tour</span>
          </div>
          <button onClick={stopTour} className="p-1 hover:bg-surface-container rounded-full transition-colors">
            <X className="w-4 h-4 text-outline" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentStep ? "bg-primary w-4" : "bg-outline-variant"
                )} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="p-2 border border-outline-variant/20 rounded-lg text-primary hover:bg-surface-container transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={nextStep}
              className="px-4 py-2 crema-gradient text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button 
          onClick={stopTour}
          className="mt-4 w-full text-center text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors"
        >
          Skip Tour
        </button>
      </motion.div>
    </div>
  );
};

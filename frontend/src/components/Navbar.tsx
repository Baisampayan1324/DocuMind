import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto z-50 px-6 py-3 flex items-center justify-between md:gap-12 lg:gap-24 bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/20 rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] transition-all duration-300">
      <Link to="/" className="flex items-center shrink-0">
        <span className="text-xl font-bold text-primary tracking-tight">DocuMind</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Features</a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">GitHub</a>
        <Link to="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">About</Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-6">
          <Link to="/setup" className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95 text-sm">
            Get Started
          </Link>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-primary hover:bg-surface-container rounded-full transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-4 bg-surface-container-lowest border border-outline-variant/20 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 md:hidden"
          >
            <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-bold text-primary p-2 hover:bg-surface-container rounded-xl transition-all">Features</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="text-lg font-bold text-primary p-2 hover:bg-surface-container rounded-xl transition-all">GitHub</a>
            <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-bold text-primary p-2 hover:bg-surface-container rounded-xl transition-all">About</Link>
            <div className="h-px bg-outline-variant/10 my-2" />
            <Link to="/setup" onClick={() => setIsOpen(false)} className="bg-primary text-on-primary text-center py-4 rounded-xl font-bold shadow-lg">
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

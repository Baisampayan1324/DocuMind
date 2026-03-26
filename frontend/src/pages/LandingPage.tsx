import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { TextReveal } from '../components/TextReveal';
import { MagneticButton } from '../components/MagneticButton';
import { ChatAnimation } from '../components/ChatAnimation';
import { BentoFeatures } from '../components/BentoFeatures';
import { GridBackground } from '../components/GridBackground';
import { AmbientGlow } from '../components/AmbientGlow';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <GridBackground />
      <AmbientGlow />
      <Navbar />
      
      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-40 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-10 tracking-[0.3em] uppercase border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen AI Archivist
          </motion.div>
          
          <div className="relative mb-10">
            <h1 className="text-[4rem] md:text-[6.5rem] font-bold tracking-tighter text-primary leading-[0.95] mb-4">
              <TextReveal text="Chat with Your Documents" />
              <TextReveal text=" Intelligently" className="text-primary/40 italic font-medium" />
            </h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto text-xl text-on-surface-variant mb-16 leading-relaxed font-medium"
          >
            Transform your cluttered archives into a living knowledge base. DocuMind uses advanced neural search to help you find, extract, and summarize insights instantly.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagneticButton to="/setup">
              <div className="crema-gradient text-on-primary px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                Start for free
                <ArrowRight className="w-5 h-5" />
              </div>
            </MagneticButton>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 0.8,
              duration: 1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="mt-32 relative max-w-5xl mx-auto"
          >
            <motion.div 
              animate={{ 
                rotateX: [2, -2, 2],
                rotateY: [-2, 2, -2],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 6, 
                ease: "easeInOut" 
              }}
              style={{ perspective: 1000 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
              <div className="absolute -inset-10 bg-secondary/5 blur-[120px] rounded-full opacity-30 translate-x-20"></div>
              
              <div className="relative bg-surface-container-lowest rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-outline-variant/20 aspect-video flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <ChatAnimation />
              </div>
            </motion.div>
          </motion.div>
        </section>

        <BentoFeatures />

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="bg-primary-container rounded-[2rem] p-12 md:p-20 text-center text-on-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to meet your archives?</h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto mb-12">
                Join 2,000+ researchers, lawyers, and analysts who are saving 10+ hours a week with DocuMind.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/setup" className="bg-surface text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-surface-bright transition-all active:scale-95 shadow-xl">
                  Get Started Now
                </Link>
                <span className="text-sm font-medium opacity-80">No credit card required.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="border-t border-outline-variant/10 py-16 mt-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-primary tracking-tight">DocuMind</span>
              </Link>
              <p className="text-on-surface-variant max-w-sm leading-relaxed">
                Empowering researchers, legal professionals, and analysts with AI-driven document intelligence. 
                Transform your archives into an interactive knowledge base.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Features</a></li>
                <li><Link to="/setup" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-outline font-medium">
              © 2024 DocuMind. All rights reserved. Crafted for the curious.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

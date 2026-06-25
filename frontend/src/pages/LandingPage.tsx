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
import { isSetupComplete } from '../lib/setupState';

export default function LandingPage() {
  const getStartedPath = isSetupComplete() ? '/dashboard' : '/setup';

  return (
    <div className="min-h-screen bg-background relative">
      <GridBackground />
      <AmbientGlow />
      <Navbar />
      
      <main className="pt-20 sm:pt-28 md:pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-16 sm:pb-28 md:pb-40 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-bold mb-6 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em] uppercase border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Next-Gen AI Archivist
          </motion.div>
          
          <div className="relative mb-6 sm:mb-10">
            <h1 className="text-[2.4rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-bold tracking-tighter text-primary leading-[0.95] mb-4">
              <TextReveal text="Chat with Your Documents" />
              <TextReveal text=" Intelligently" className="text-primary/40 italic font-medium" />
            </h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-on-surface-variant mb-8 sm:mb-12 md:mb-16 leading-relaxed font-medium px-2"
          >
            Transform your cluttered archives into a living knowledge base. DocuMind uses advanced neural search to help you find, extract, and summarize insights instantly.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <MagneticButton to={getStartedPath}>
              <div className="crema-gradient text-on-primary px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                Start for free
                <ArrowRight className="w-5 h-5" />
              </div>
            </MagneticButton>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 sm:mt-20 md:mt-28 lg:mt-32 relative max-w-5xl mx-auto"
          >
            {/* Ambient glow — scales with screen */}
            <div className="absolute -inset-3 sm:-inset-8 md:-inset-10
                            bg-primary/10 blur-[50px] sm:blur-[90px] md:blur-[120px]
                            rounded-full opacity-50 pointer-events-none" />
            <div className="absolute -inset-3 sm:-inset-8 md:-inset-10
                            bg-secondary/5 blur-[50px] sm:blur-[90px] md:blur-[120px]
                            rounded-full opacity-30 translate-x-6 sm:translate-x-14 md:translate-x-20
                            pointer-events-none" />

            {/*
              Card height strategy:
              • phone  (<480px)  → 320px  — portrait, shows 2 messages
              • sm     (≥640px)  → 380px  — shows 3 messages
              • md     (≥768px)  → aspect-video (natural 16:9)
              We use a responsive class chain + md:aspect-video to switch
            */}
            <div className="relative overflow-hidden border border-outline-variant/20
                            bg-surface-container-lowest group
                            rounded-2xl sm:rounded-3xl md:rounded-[2.5rem]
                            shadow-[0_12px_40px_-8px_rgba(0,0,0,0.16)]
                            sm:shadow-[0_24px_56px_-12px_rgba(0,0,0,0.18)]
                            md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]
                            h-[320px] sm:h-[380px] md:h-auto md:aspect-video">
              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5
                              opacity-0 group-hover:opacity-100 transition-opacity duration-1000
                              pointer-events-none z-10" />
              <ChatAnimation />
            </div>
          </motion.div>
        </section>

        <BentoFeatures />

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-24">
          <div className="bg-primary-container rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-12 md:p-20 text-center text-on-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 blur-[80px] sm:blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 sm:mb-8">Ready to meet your archives?</h2>
              <p className="text-base sm:text-lg opacity-90 max-w-xl mx-auto mb-8 sm:mb-12">
                Join 2,000+ researchers, lawyers, and analysts who are saving 10+ hours a week with DocuMind.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link to={getStartedPath} className="bg-surface text-primary px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-surface-bright transition-all active:scale-95 shadow-xl w-full sm:w-auto text-center">
                  Get Started Now
                </Link>
                <span className="text-sm font-medium opacity-80">No credit card required.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="border-t border-outline-variant/10 py-12 sm:py-16 mt-12 sm:mt-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            <div className="col-span-2 sm:col-span-2 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-primary tracking-tight">DocuMind</span>
              </Link>
              <p className="text-on-surface-variant max-w-sm leading-relaxed text-sm sm:text-base">
                Empowering researchers, legal professionals, and analysts with AI-driven document intelligence. 
                Transform your archives into an interactive knowledge base.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-4 sm:mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><a href="#features" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Features</a></li>
                <li><Link to={getStartedPath} className="text-sm text-on-surface-variant hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-4 sm:mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link to="/about" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-outline font-medium text-center md:text-left">
              © 2024 DocuMind. All rights reserved. Crafted for the curious.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

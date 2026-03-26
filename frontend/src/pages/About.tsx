import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Info, Target, Users, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-primary mb-6 tracking-tight">About DocuMind</h1>
            <p className="text-xl text-on-surface-variant leading-relaxed">
              We are building the future of document intelligence, making complex information accessible to everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="text-on-surface-variant leading-relaxed">
                To empower professionals with AI-driven tools that transform static documents into interactive knowledge bases, saving time and uncovering hidden insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Our Team</h3>
              <p className="text-on-surface-variant leading-relaxed">
                A diverse group of engineers, designers, and AI researchers dedicated to creating the most intuitive and powerful document analysis platform.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert max-w-none text-on-surface-variant"
          >
            <h2 className="text-3xl font-bold text-primary mb-6">The Story</h2>
            <p className="mb-6 leading-relaxed">
              DocuMind started with a simple observation: the world is drowning in information but starving for knowledge. We saw researchers spending weeks manually scanning PDFs, legal teams struggling with thousands of pages of discovery, and students overwhelmed by academic papers.
            </p>
            <p className="mb-6 leading-relaxed">
              We decided to build a bridge. By combining state-of-the-art Large Language Models with a focus on user experience, we've created a platform that doesn't just read documents—it understands them.
            </p>
            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 mt-12">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="text-primary w-6 h-6" />
                <h4 className="text-xl font-bold text-primary">Our Commitment</h4>
              </div>
              <p className="text-on-surface-variant italic">
                "We believe in responsible AI. Your data is yours, your privacy is paramount, and our goal is to augment human intelligence, not replace it."
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

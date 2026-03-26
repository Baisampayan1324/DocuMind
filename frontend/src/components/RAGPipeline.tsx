import React from 'react';
import { motion } from 'motion/react';
import { Database, FileText, Search, Cpu, MessageSquare } from 'lucide-react';

export const RAGPipeline: React.FC = () => {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Under the Hood</h2>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">Retrieval-Augmented Generation (RAG) architecture ensures accurate, context-aware responses.</p>
      </div>
      
      <div className="relative max-w-4xl mx-auto bg-surface-container-low p-8 md:p-12 rounded-[3rem] border border-outline-variant/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          
          <div className="col-span-1 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <FileText className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-center">Your Documents</span>
          </div>
          
          <div className="col-span-1 flex justify-center">
            <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-1 w-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
            </motion.div>
          </div>
          
          <div className="col-span-1 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-center">Vector Database</span>
          </div>
          
          <div className="col-span-1 flex justify-center">
            <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="h-1 w-full bg-gradient-to-r from-emerald-500/20 to-purple-500/20 rounded-full relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500" />
            </motion.div>
          </div>
          
          <div className="col-span-1 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Cpu className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-center">LLM Generation</span>
          </div>
          
        </div>
      </div>
    </section>
  );
};

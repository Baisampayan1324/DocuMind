import React from 'react';
import { motion } from 'motion/react';
import { Upload, Cpu, MessageSquare } from 'lucide-react';

export const Workflow: React.FC = () => {
  const steps = [
    {
      title: "1. Upload",
      description: "Securely upload your documents (PDF, DOCX, TXT).",
      icon: Upload
    },
    {
      title: "2. Process",
      description: "Our AI extracts text, creates embeddings, and indexes the content.",
      icon: Cpu
    },
    {
      title: "3. Chat",
      description: "Ask questions and get instant, cited answers from your data.",
      icon: MessageSquare
    }
  ];

  return (
    <section className="py-24 bg-surface-container-lowest border-y border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">How it Works</h2>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">From raw documents to actionable insights in three simple steps.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center"
            >
              <div className="w-24 h-24 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-8 border-4 border-background relative z-10 shadow-xl">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

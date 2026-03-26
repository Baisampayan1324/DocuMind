import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { useTour } from '../context/TourContext';

type HelpCategory = 'getting-started' | 'advanced-queries' | 'chat-tips' | 'contact-support' | null;

export default function Help() {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { startTour } = useTour();

  const renderContent = () => {
    switch (activeCategory) {
      case 'getting-started':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary-container/10 p-8 rounded-3xl border border-primary-container/20">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <Book className="w-6 h-6" /> Getting Started
              </h2>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Upload Documents', desc: 'Go to the Documents section and click "Upload New". We support PDF, DOCX, and images.' },
                  { step: '2', title: 'Neural Indexing', desc: 'Wait a few seconds while our AI vectorizes your content for semantic search.' },
                  { step: '3', title: 'Start Chatting', desc: 'Head to the Dashboard, select your document, and ask anything in natural language.' },
                  { step: '4', title: 'Extract Insights', desc: 'Use the summary and audit tools to quickly pull structured data from your archives.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={startTour}
                className="mt-8 w-full py-4 crema-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
              >
                Start Interactive Tour
              </button>
            </div>
          </div>
        );
      case 'advanced-queries':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" /> Advanced Queries
            </h2>
            <div className="grid gap-4">
              {[
                { q: 'Cross-Document Analysis', desc: 'Compare the financial results of Document A and Document B for the fiscal year 2023.' },
                { q: 'Structured Extraction', desc: 'Extract all dates, amounts, and vendor names from these invoices into a table format.' },
                { q: 'Semantic Reasoning', desc: 'Based on the legal precedents mentioned, what are the potential risks for our current contract?' },
                { q: 'Summarization with Focus', desc: 'Summarize this 50-page report focusing only on the environmental impact sections.' },
              ].map((item, i) => (
                <div key={i} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-container" /> {item.q}
                  </h4>
                  <p className="text-sm text-on-surface-variant italic">"{item.desc}"</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'chat-tips':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" /> Chat Tips for Power Users
            </h2>
            <div className="space-y-4">
              {[
                { title: 'Be Specific', desc: 'Instead of "Summarize this", try "Summarize the key financial risks mentioned in section 4".' },
                { title: 'Use Context', desc: 'Reference specific pages or sections to guide the AI to the right information.' },
                { title: 'Iterative Refinement', desc: 'If the first answer isn\'t perfect, ask follow-up questions like "Can you explain that in simpler terms?"' },
                { title: 'Format Requests', desc: 'Ask for output in specific formats: "List these as bullet points" or "Create a 3-column table".' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <Lightbulb className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-primary mb-1">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'contact-support':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8 shadow-inner">
                <Mail className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold text-primary mb-4 tracking-tight">We're here to help</h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Whether you're facing a technical hurdle, need custom enterprise solutions, or just want to say hello—our team is ready.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-primary mb-2">Email Support</h4>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  For general inquiries, technical issues, and billing questions.
                </p>
                <a href="mailto:support@documind.ai" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  support@documind.ai <ChevronRight className="w-4 h-4" />
                </a>
                <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center gap-2 text-xs text-outline font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Response time: &lt; 2 hours
                </div>
              </div>

              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-primary mb-2">Live Chat</h4>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Available for real-time assistance during business hours. Our experts are ready to help you with complex queries.
                </p>
                <button className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all">
                  Start a conversation <ChevronRight className="w-4 h-4" />
                </button>
                <div className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center gap-2 text-xs text-outline font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary" /> Mon-Fri, 9AM - 6PM EST
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-8">
                <div className="text-center">
                  <ShieldCheck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Secure</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Reliable</p>
                </div>
                <div className="text-center">
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Fast</p>
                </div>
              </div>
              <p className="text-xs text-outline font-medium">
                © 2026 DocuMind AI. All rights reserved.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto min-h-screen">
      <AnimatePresence mode="wait">
        {activeCategory ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button 
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Help Center
            </button>
            {renderContent()}
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <header className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container rounded-2xl mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-primary tracking-tight mb-4">How can we help?</h1>
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for guides, tutorials, and more..." 
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/10 shadow-sm"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { id: 'getting-started', icon: Book, title: 'Getting Started', desc: 'Learn the basics of DocuMind and how to upload your first doc.' },
                { id: 'advanced-queries', icon: FileText, title: 'Advanced Queries', desc: 'Master semantic search and complex data extraction.' },
                { id: 'chat-tips', icon: MessageCircle, title: 'Chat Tips', desc: 'How to get the best summaries and insights from the AI.' },
                { id: 'contact-support', icon: Mail, title: 'Contact Support', desc: 'Need more help? Our team of archivists is here for you.' },
              ].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveCategory(item.id as HelpCategory)}
                  className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <section className="bg-surface-container p-10 rounded-3xl border border-outline-variant/10">
              <h2 className="text-2xl font-bold text-primary mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {[
                  { q: 'Is my data secure?', a: 'Yes, all documents are encrypted at rest and in transit. We use enterprise-grade security protocols.' },
                  { q: 'Which file formats are supported?', a: 'We currently support PDF, DOCX, TXT, and scanned images (JPG/PNG) via OCR.' },
                  { q: 'Can I use my own API keys?', a: 'Absolutely. You can configure your own OpenAI or Anthropic keys in the settings.' },
                ].map((faq, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold text-primary">{faq.q}</h4>
                    <p className="text-sm text-on-surface-variant">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

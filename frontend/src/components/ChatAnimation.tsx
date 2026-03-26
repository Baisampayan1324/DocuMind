import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Bot, ArrowRight } from 'lucide-react';

const CHAT_SCRIPT = [
  { role: 'user', text: 'Summarize the findings in the Q3 report.' },
  { role: 'bot', text: 'The Q3 report highlights a 12% increase in neural efficiency and a 5% drop in latency. Overall sentiment is positive.' },
  { role: 'user', text: 'Were there any risks identified?' },
  { role: 'bot', text: 'Yes, minor latency issues were noted in the vectorize step during peak loads. This affected 2.4% of total queries.' },
  { role: 'user', text: 'What is the recommended solution?' },
  { role: 'bot', text: 'The engineering team suggests scaling the vector database clusters and implementing a Redis caching layer to mitigate peak load latency.' },
  { role: 'user', text: 'Draft a quick email to the team with these points.' },
  { role: 'bot', text: 'Subject: Q3 Report Summary & Next Steps\n\nHi team,\n\nThe Q3 report is looking good. We saw a 12% increase in efficiency. We need to address minor latency in the vectorize step by scaling clusters.\n\nBest,\nAI Assistant' },
  { role: 'user', text: 'Looks perfect. Send it out.' },
  { role: 'bot', text: 'Email has been queued for sending. Is there anything else you need help with today?' }
];

const TypewriterText = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onComplete();
      }
    }, 15); // Fast typing speed
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      <span className="inline-block w-1.5 h-3.5 ml-1 bg-stone-400 animate-pulse align-middle" />
    </span>
  );
};

export const ChatAnimation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    if (currentIndex >= CHAT_SCRIPT.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(0);
        setTypingComplete(false);
        setLoopCount(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }

    const currentMsg = CHAT_SCRIPT[currentIndex];
    if (currentMsg.role === 'user') {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Bot message
      if (typingComplete) {
        const timer = setTimeout(() => {
          setTypingComplete(false);
          setCurrentIndex(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, typingComplete]);

  const visibleMessages = CHAT_SCRIPT.slice(0, currentIndex + 1);

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden font-sans pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold tracking-widest text-stone-700 uppercase">Neural Link</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
        </div>
      </div>
      
      {/* Chat Body */}
      <div 
        ref={scrollRef}
        className="p-6 flex-1 flex flex-col gap-6 overflow-hidden bg-[#faf9f7] scroll-smooth"
      >
        {visibleMessages.map((msg, idx) => {
          const isLast = idx === currentIndex;
          if (msg.role === 'user') {
            return (
              <motion.div 
                key={`${loopCount}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end gap-3"
              >
                <div className="bg-[#5c3a21] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#5c3a21] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              </motion.div>
            );
          } else {
            return (
              <motion.div 
                key={`${loopCount}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f0ece6] flex items-center justify-center text-stone-700 shrink-0 shadow-sm border border-stone-200/50">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-[#f0ece6] text-stone-700 px-5 py-3.5 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm border border-stone-200/50">
                  <p className="text-sm leading-relaxed">
                    {isLast ? (
                      <TypewriterText 
                        text={msg.text} 
                        onComplete={() => setTypingComplete(true)} 
                      />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </p>
                </div>
              </motion.div>
            );
          }
        })}
      </div>

      {/* Footer Input */}
      <div className="p-4 bg-white border-t border-stone-100 z-10">
        <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-sm text-stone-400 italic">
            {currentIndex >= CHAT_SCRIPT.length 
              ? "Session ended." 
              : CHAT_SCRIPT[currentIndex]?.role === 'bot' && !typingComplete
                ? "AI is typing..."
                : "Analyzing document stack..."}
          </span>
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

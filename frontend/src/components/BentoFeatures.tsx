import React, { useEffect, useRef, useState } from 'react';
import { FileText, Search, Shield, MessageSquare } from 'lucide-react';

export const BentoFeatures: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      title: "Summarize & Extract",
      description: "Turn 100-page reports into 5 key bullet points in seconds. Automatically pull tables, dates, and names into structured data without manual data entry.",
      icon: FileText,
      colSpan: "col-span-1 md:col-span-2",
    },
    {
      title: "Semantic Search",
      description: "Find exactly what you're looking for. Our AI understands context and concepts, not just exact keywords.",
      icon: Search,
      colSpan: "col-span-1",
    },
    {
      title: "Ask Anything",
      description: "A conversational interface for your private docs. Ask questions and get answers with exact citations.",
      icon: MessageSquare,
      colSpan: "col-span-1",
    },
    {
      title: "Secure & Lightning Fast",
      description: "Process thousands of documents in milliseconds. Enterprise-grade encryption ensures your private data is never used to train public models.",
      icon: Shield,
      colSpan: "col-span-1 md:col-span-2",
    }
  ];

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className={`py-12 sm:py-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 bg-[#faf9f7] rounded-[2rem] sm:rounded-[3rem] my-6 sm:my-10 md:my-12 ${isVisible ? 'visible' : ''}`}
    >
      <div className="mb-10 sm:mb-14 md:mb-16 max-w-2xl text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-[#5c3a21]">Master Your Knowledge</h2>
        <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto md:mx-0">Four core capabilities designed to eliminate manual document searching forever.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {features.map((feature, i) => (
          <div 
            key={i}
            className={`bg-white p-6 sm:p-7 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-stone-100 flex flex-col group ${feature.colSpan} feature-card-hidden ${isVisible ? 'feature-card-visible' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f0ece6] text-[#5c3a21] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-[#5c3a21]">{feature.title}</h3>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

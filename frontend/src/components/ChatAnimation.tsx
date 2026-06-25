import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bot, ArrowRight, Zap } from 'lucide-react';

/* ─── Chat script ────────────────────────────────────────────────────────── */
const CHAT_SCRIPT = [
  { role: 'user',  text: 'Summarize the Q3 report findings.' },
  { role: 'bot',   text: 'Q3 shows a 12% boost in neural efficiency and 5% drop in latency. Overall sentiment: positive.' },
  { role: 'user',  text: 'Any risks identified?' },
  { role: 'bot',   text: 'Minor latency spikes in the vectorize step at peak load — affected ~2.4% of queries.' },
  { role: 'user',  text: 'Recommended fix?' },
  { role: 'bot',   text: 'Scale vector DB clusters and add a Redis caching layer to absorb peak-load bursts.' },
  { role: 'user',  text: 'Perfect. Draft the team email.' },
  { role: 'bot',   text: 'Done! Email queued with Q3 highlights and next-step action items. Anything else?' },
];

/* ─── How many messages to SHOW per screen size ─────────────────────────── */
function useVisibleCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480)       setCount(2); // phone
      else if (w < 768)  setCount(3); // large phone / small tablet
      else if (w < 1024) setCount(4); // tablet / landscape
      else               setCount(6); // laptop / desktop
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

/* ─── Typewriter ─────────────────────────────────────────────────────────── */
const TypewriterText = ({
  text,
  onComplete,
  speed = 20,
}: {
  text: string;
  onComplete: () => void;
  speed?: number;
}) => {
  const [shown, setShown] = useState('');
  const cb = useCallback(onComplete, []);

  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); cb(); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, cb]);

  return (
    <span className="whitespace-pre-wrap">
      {shown}
      <span className="inline-block w-0.5 h-[0.85em] ml-0.5 bg-stone-400 animate-pulse align-middle rounded-full" />
    </span>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
export const ChatAnimation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingComplete, setTypingComplete]  = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const visibleMax = useVisibleCount();

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  /* conversation driver */
  useEffect(() => {
    if (currentIndex >= CHAT_SCRIPT.length) {
      const t = setTimeout(() => {
        setCurrentIndex(0);
        setTypingComplete(false);
        setLoopCount(p => p + 1);
      }, 3500);
      return () => clearTimeout(t);
    }
    const msg = CHAT_SCRIPT[currentIndex];
    if (msg.role === 'user') {
      const t = setTimeout(() => setCurrentIndex(p => p + 1), 1100);
      return () => clearTimeout(t);
    }
    if (typingComplete) {
      const t = setTimeout(() => {
        setTypingComplete(false);
        setCurrentIndex(p => p + 1);
      }, 1300);
      return () => clearTimeout(t);
    }
  }, [currentIndex, typingComplete]);

  /* show only the most recent `visibleMax` messages */
  const allMessages  = CHAT_SCRIPT.slice(0, currentIndex + 1);
  const visible      = allMessages.slice(-visibleMax);
  const hiddenAbove  = allMessages.length - visible.length;

  const statusText =
    currentIndex >= CHAT_SCRIPT.length
      ? 'Session complete.'
      : CHAT_SCRIPT[currentIndex]?.role === 'bot' && !typingComplete
      ? 'AI is typing…'
      : 'Ask anything about your documents…';

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans pointer-events-none select-none">

      {/* ── Title bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between
                      px-3 py-2
                      sm:px-5 sm:py-3
                      md:px-6 md:py-4
                      border-b border-stone-100 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400" />
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs
                           font-bold tracking-[0.18em] sm:tracking-[0.22em] md:tracking-widest
                           text-stone-600 uppercase">
            Neural Link
          </span>
          {/* tiny "live" badge — hidden on very small screens */}
          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700
                            text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded-full
                            border border-emerald-200/60 uppercase tracking-wider">
            <Zap className="w-2 h-2" />
            Live
          </span>
        </div>
        {/* macOS-style dots */}
        <div className="flex gap-1 sm:gap-1.5">
          {['bg-red-300','bg-yellow-300','bg-green-300'].map(c => (
            <div key={c} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${c}`} />
          ))}
        </div>
      </div>

      {/* ── Chat body ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        className="flex-1 overflow-y-auto bg-[#faf9f7]
                   px-2 py-2 gap-2
                   sm:px-4 sm:py-3 sm:gap-3
                   md:px-6 md:py-4 md:gap-4
                   lg:px-7 lg:py-5 lg:gap-5
                   flex flex-col"
      >
        {/* faded "older messages" hint when some are hidden */}
        <AnimatePresence>
          {hiddenAbove > 0 && (
            <motion.div
              key="older-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[8px] sm:text-[9px] md:text-[10px]
                         text-stone-400 font-medium tracking-wide py-0.5"
            >
              ↑ {hiddenAbove} earlier message{hiddenAbove > 1 ? 's' : ''}
            </motion.div>
          )}
        </AnimatePresence>

        {visible.map((msg, idx) => {
          const globalIdx = hiddenAbove + idx;
          const isLast    = globalIdx === currentIndex;
          const isUser    = msg.role === 'user';

          return (
            <motion.div
              key={`${loopCount}-${globalIdx}`}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`flex items-end
                ${isUser ? 'justify-end' : 'justify-start'}
                gap-1.5 sm:gap-2 md:gap-3`}
            >
              {/* Bot avatar — left */}
              {!isUser && (
                <div className="shrink-0
                                w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9
                                rounded-md sm:rounded-lg md:rounded-xl
                                bg-[#f0ece6] border border-stone-200/60
                                flex items-center justify-center text-stone-600 shadow-sm">
                  <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`
                  max-w-[78%] sm:max-w-[75%] md:max-w-[72%]
                  px-2.5 py-1.5
                  sm:px-3.5 sm:py-2
                  md:px-4 md:py-2.5
                  lg:px-5 lg:py-3
                  shadow-sm
                  ${isUser
                    ? 'bg-[#5c3a21] text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white text-stone-700 rounded-2xl rounded-tl-sm border border-stone-100'}
                `}
              >
                <p className="text-[10px] sm:text-xs md:text-[13px] lg:text-sm
                              leading-snug sm:leading-normal md:leading-relaxed
                              font-normal whitespace-pre-wrap">
                  {!isUser && isLast ? (
                    <TypewriterText
                      text={msg.text}
                      onComplete={() => setTypingComplete(true)}
                      speed={16}
                    />
                  ) : (
                    msg.text
                  )}
                </p>
              </div>

              {/* User avatar — right */}
              {isUser && (
                <div className="shrink-0
                                w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9
                                rounded-md sm:rounded-lg md:rounded-xl
                                bg-[#5c3a21]
                                flex items-center justify-center text-white shadow-sm">
                  <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* typing indicator — shows between bot messages */}
        <AnimatePresence>
          {currentIndex < CHAT_SCRIPT.length &&
            CHAT_SCRIPT[currentIndex]?.role === 'bot' &&
            !typingComplete && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-1.5 sm:gap-2 md:gap-3"
            >
              <div className="shrink-0
                              w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9
                              rounded-md sm:rounded-lg md:rounded-xl
                              bg-[#f0ece6] border border-stone-200/60
                              flex items-center justify-center text-stone-600 shadow-sm">
                <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              </div>
              <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm
                              px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm
                              flex items-center gap-1 sm:gap-1.5">
                {[0, 160, 320].map(delay => (
                  <span
                    key={delay}
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-stone-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-stone-100 z-10
                      px-2 py-1.5
                      sm:px-4 sm:py-2.5
                      md:px-5 md:py-3">
        <div className="flex items-center justify-between
                        bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl md:rounded-2xl
                        px-2.5 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2.5
                        shadow-sm gap-2">
          <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm
                           text-stone-400 italic truncate">
            {statusText}
          </span>
          <div className="shrink-0
                          w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8
                          rounded-full bg-[#5c3a21]/10
                          flex items-center justify-center text-[#5c3a21]">
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

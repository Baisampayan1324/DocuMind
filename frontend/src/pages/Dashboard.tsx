import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, FileText, Paperclip, ArrowUp,
  Mic, X, Loader2, Plus, User, Bot, AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { uploadFiles, askQuestion, AskResponse } from '../lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: AskResponse['sources'];
  provider?: string;
  duration_s?: number;
  timestamp: number;
}

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── File handling ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Send message ─────────────────────────────────────────────────────────

  const handleSend = async () => {
    const q = message.trim();
    if (!q && attachedFiles.length === 0) return;
    if (isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      role: 'user',
      content: q || `📎 ${attachedFiles.map((f) => f.name).join(', ')}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      // 1. Upload files first if any
      if (attachedFiles.length > 0) {
        await uploadFiles(attachedFiles);
        setAttachedFiles([]);
      }

      // 2. Ask question (only if there's text)
      if (q) {
        const res = await askQuestion(q);
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          provider: res.meta?.provider,
          duration_s: res.meta?.duration_s,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Files uploaded with no question — confirm indexing
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: `✅ ${attachedFiles.length > 1 ? `${attachedFiles.length} files` : '1 file'} uploaded and indexed successfully. You can now ask questions about the content.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${e.message || 'Could not reach backend.'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Voice recognition ────────────────────────────────────────────────────

  const getRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onstart = () => setIsListening(true);
    r.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final.trim()) setMessage((prev) => prev + (prev ? ' ' : '') + final.trim());
    };
    r.onerror = (ev: any) => {
      setIsListening(false);
      if (ev.error === 'not-allowed') {
        shouldKeepListeningRef.current = false;
        alert('Microphone access denied.');
      }
    };
    r.onend = () => {
      setIsListening(false);
      if (!shouldKeepListeningRef.current) return;
      setTimeout(() => { try { r.start(); } catch { setIsListening(false); } }, 150);
    };
    recognitionRef.current = r;
    return r;
  };

  const startListening = () => {
    const r = getRecognition();
    if (!r) { alert('Speech recognition not supported.'); return; }
    shouldKeepListeningRef.current = true;
    try { r.start(); } catch (err: any) {
      if (!err?.message?.includes('already started')) { shouldKeepListeningRef.current = false; setIsListening(false); }
    }
  };

  const stopListening = () => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  useEffect(() => () => { shouldKeepListeningRef.current = false; recognitionRef.current?.stop?.(); }, []);

  // ── Provider badge ────────────────────────────────────────────────────────

  const providerColor = (p?: string) => {
    if (!p) return 'bg-surface-container text-outline';
    if (p.includes('groq')) return 'bg-orange-100 text-orange-700';
    if (p.includes('openai')) return 'bg-green-100 text-green-700';
    if (p.includes('gemini')) return 'bg-blue-100 text-blue-700';
    if (p.includes('fusion')) return 'bg-primary/10 text-primary';
    if (p.includes('openrouter')) return 'bg-purple-100 text-purple-700';
    return 'bg-surface-container text-outline';
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative">

      {/* ── Chat thread ───────────────────────────────────────────────── */}
      <div className={cn('flex-1 overflow-y-auto px-4 md:px-8', isEmpty ? 'flex flex-col items-center justify-center' : 'pt-8 pb-48 md:pb-52')}>
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container rounded-2xl mb-6 shadow-sm">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary leading-tight mb-4">
              What can I help with?
            </h2>
            <p className="text-outline text-lg">
              Upload a document and ask anything — the RAG engine will find answers with source citations.
            </p>

            {/* Quick-start prompts */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                { label: '📄 Summarize a document', hint: 'Upload a PDF and get a summary' },
                { label: '🔍 Find specific info', hint: 'Ask about details in your docs' },
                { label: '📊 Extract key points', hint: 'Get structured insights' },
                { label: '❓ Ask a question', hint: 'Any question about indexed content' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setMessage(p.label.replace(/^.{2}/, '').trim())}
                  className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/40 hover:bg-surface-container transition-all text-left group"
                >
                  <p className="font-semibold text-primary text-sm">{p.label}</p>
                  <p className="text-xs text-outline mt-1">{p.hint}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={cn('max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-md'
                      : 'bg-surface-container-lowest border border-outline-variant/20 text-primary rounded-bl-md'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.sources.map((s, si) => (
                        <span key={si} className="text-[9px] font-bold bg-surface-container text-outline border border-outline-variant/20 px-2 py-0.5 rounded-full">
                          📄 {s.source}{s.page ? ` p.${s.page}` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Provider + time */}
                  {msg.provider && (
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide', providerColor(msg.provider))}>
                        {msg.provider.replace('fusion:', '⚡ ')}
                      </span>
                      {msg.duration_s && (
                        <span className="text-[9px] text-outline">{msg.duration_s.toFixed(1)}s</span>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-on-primary" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl rounded-bl-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-outline">Processing with RAG engine…</span>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar (fixed bottom) ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 md:absolute p-4 md:p-8 pt-0 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-20">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 px-4 py-2 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2 text-sm text-error"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File chips */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-2">
                {attachedFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 bg-[#EBE5DB] px-3 py-1.5 rounded-full text-xs font-medium text-[#3D1F10] border border-[#3D1F10]/10 shadow-sm"
                  >
                    <FileText className="w-3 h-3 opacity-70" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="hover:text-error transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div className="flex items-center gap-2 md:gap-4 p-2 bg-white border border-[#3D1F10]/20 rounded-full shadow-sm focus-within:border-[#3D1F10]/40 focus-within:shadow-md transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.docx,.txt,.pptx,.png,.jpg,.jpeg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-[#3D1F10]/50 hover:text-[#3D1F10] hover:bg-[#3D1F10]/5 rounded-full transition-all shrink-0"
              title="Attach file"
            >
              <Plus className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex items-center relative">
              <textarea
                ref={textareaRef}
                className="w-full max-h-32 md:max-h-48 min-h-[40px] md:min-h-[48px] py-3 md:py-3.5 bg-transparent border-none focus:outline-none focus:ring-0 text-[#3D1F10] placeholder:text-[#3D1F10]/40 text-sm md:text-base resize-none"
                placeholder="Ask anything about your documents…"
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (isListening) stopListening();
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                disabled={isLoading}
              />
              {isListening && (
                <div className="absolute left-0 -top-7 flex items-center gap-2 text-[10px] font-bold text-[#3D1F10] uppercase tracking-widest animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Listening…
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  'flex items-center justify-center w-10 h-10 md:w-12 md:h-12 transition-all rounded-full shrink-0',
                  isListening ? 'bg-error/10 text-error animate-pulse' : 'text-[#3D1F10]/50 hover:text-[#3D1F10] hover:bg-[#3D1F10]/5'
                )}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <Mic className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading || (!message.trim() && attachedFiles.length === 0)}
                className={cn(
                  'bg-[#3D1F10] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-md transition-all shrink-0',
                  isLoading || (!message.trim() && attachedFiles.length === 0)
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:opacity-90 active:scale-95'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-outline/50 mt-2">
            Upload docs via the <strong>+</strong> button · Type a question · Press Enter
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, MessageSquare, Clock, ArrowRight, Trash2, AlertTriangle, Loader2, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { fetchHistory, searchConversations, Conversation } from '../lib/api';

export default function History() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const load = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      if (query.trim()) {
        const res = await searchConversations(query);
        setChats(res.results);
      } else {
        const data = await fetchHistory({ limit: 200 });
        setChats(data);
      }
    } catch (e: any) {
      setError(e.message || 'Cannot reach backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Date filtering (client-side on already-fetched data)
  const now = new Date();
  const filtered = chats.filter((c) => {
    if (dateRange === 'all') return true;
    const d = new Date(c.timestamp);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (dateRange === 'today') return diffDays < 1;
    if (dateRange === 'yesterday') return diffDays >= 1 && diffDays < 2;
    if (dateRange === 'week') return diffDays < 7;
    if (dateRange === 'month') return diffDays < 30;
    return true;
  });

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const providerBadge = (provider: string) => {
    const p = provider?.toLowerCase() || '';
    if (p.includes('groq')) return 'bg-orange-100 text-orange-700';
    if (p.includes('openai')) return 'bg-green-100 text-green-700';
    if (p.includes('gemini')) return 'bg-blue-100 text-blue-700';
    if (p.includes('openrouter')) return 'bg-purple-100 text-purple-700';
    if (p.includes('fusion')) return 'bg-primary/10 text-primary';
    return 'bg-surface-container text-outline';
  };

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-1">History</h1>
          <p className="text-on-surface-variant font-medium">All conversations powered by the RAG engine.</p>
        </div>
        <button onClick={() => load(searchQuery)} className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-xl transition-all" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/60" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
        />
      </div>

      {/* Date range tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/10 w-fit">
        {dateRanges.map((range) => (
          <button
            key={range.id}
            onClick={() => setDateRange(range.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-all',
              dateRange === range.id
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
          <AlertTriangle className="w-8 h-8 text-error mx-auto mb-2" />
          <p className="font-bold text-error text-sm mb-1">Backend not reachable</p>
          <p className="text-xs text-outline">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:bg-surface-container hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
              onClick={() => navigate(`/dashboard?historyId=${item.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm leading-snug line-clamp-1 max-w-[380px]">
                      {item.question}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-outline font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </div>
                      {item.provider && (
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide', providerBadge(item.provider))}>
                          {item.provider.replace('fusion:', '⚡ ')}
                        </span>
                      )}
                      {item.duration_s > 0 && (
                        <span className="text-[9px] text-outline">{item.duration_s.toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant line-clamp-2 mt-3 pl-13">{item.answer}</p>
              {item.sources && item.sources.length > 0 && (
                <div className="mt-3 pl-13 flex flex-wrap gap-1">
                  {item.sources.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[9px] font-bold bg-surface-container text-outline px-2 py-0.5 rounded-full border border-outline-variant/20">
                      📄 {s.source}{s.page ? ` p.${s.page}` : ''}
                    </span>
                  ))}
                  {item.sources.length > 3 && (
                    <span className="text-[9px] font-bold bg-surface-container text-outline px-2 py-0.5 rounded-full border border-outline-variant/20">
                      +{item.sources.length - 3} more
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button className="bg-primary/10 text-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 group-hover:bg-primary group-hover:text-on-primary transition-all">
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
              <HistoryIcon className="w-12 h-12 text-outline/30 mx-auto mb-4" />
              <p className="text-on-surface-variant font-medium">
                {searchQuery ? `No results for "${searchQuery}"` : 'No conversations yet.'}
              </p>
              <p className="text-outline text-sm mt-1">Upload a document in the chat and start asking questions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

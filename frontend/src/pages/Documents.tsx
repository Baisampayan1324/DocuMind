import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, FileText, Trash2, X,
  MessageSquare, File as FileIcon, Image as ImageIcon,
  FileCode, ExternalLink, Filter, MoreVertical,
  Download, CheckSquare, Square, ChevronDown,
  ArrowUpDown, Heart, Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { fetchDocs, downloadDocUrl, UploadedDoc } from '../lib/api';

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDocs();
      setDocuments(res.documents);
    } catch (e: any) {
      setError(e.message || 'Cannot reach backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-error" />;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return <ImageIcon className="w-8 h-8 text-primary" />;
    if (['docx', 'doc'].includes(ext)) return <FileIcon className="w-8 h-8 text-blue-500" />;
    if (['txt', 'md'].includes(ext)) return <FileCode className="w-8 h-8 text-outline" />;
    return <FileIcon className="w-8 h-8 text-outline" />;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  };

  const filtered = documents
    .filter((doc) => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const ext = doc.name.split('.').pop()?.toLowerCase() || '';
      const now = new Date();
      const uploadDate = new Date(doc.uploaded_at);
      let matchDate = true;
      if (dateFilter === 'Last 7 Days') matchDate = (now.getTime() - uploadDate.getTime()) < 7 * 86400000;
      if (dateFilter === 'Last 30 Days') matchDate = (now.getTime() - uploadDate.getTime()) < 30 * 86400000;
      if (activeTab === 'PDFs') return matchSearch && matchDate && ext === 'pdf';
      if (activeTab === 'Images') return matchSearch && matchDate && ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
      if (activeTab === 'Docs') return matchSearch && matchDate && ['docx', 'doc', 'odt'].includes(ext);
      if (activeTab === 'Text') return matchSearch && matchDate && ['txt', 'md', 'rtf'].includes(ext);
      return matchSearch && matchDate;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'size') cmp = a.size - b.size;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-1">Indexed Documents</h1>
          <p className="text-outline">All files uploaded and indexed into the RAG engine.</p>
        </div>
        <button onClick={load} className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-xl transition-all" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Search + Filters */}
      <div className="sticky top-[80px] z-20 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-8 border-b border-outline-variant/10 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/60" />
              <input
                type="text"
                placeholder="Search documents by name..."
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'PDFs', 'Images', 'Docs', 'Text'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                    activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface-container hover:bg-surface-container-high text-outline'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-2 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 text-sm text-outline">
              <Filter className="w-4 h-4" />
              <span>Date:</span>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-transparent font-bold text-primary outline-none cursor-pointer">
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-4 w-px bg-outline-variant/20" />
            <div className="flex items-center gap-2 text-sm text-outline">
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent font-bold text-primary outline-none cursor-pointer">
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>
            <button onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-primary" title={sortOrder}>
              <ChevronDown className={cn('w-4 h-4 transition-transform', sortOrder === 'desc' && 'rotate-180')} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
          <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
          <p className="font-bold text-error mb-1">Backend not reachable</p>
          <p className="text-sm text-outline mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((doc, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-surface-container rounded-xl group-hover:bg-primary/5 transition-colors">
                    {getFileIcon(doc.name)}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-primary mb-1 truncate" title={doc.name}>{doc.name}</h3>
                  <div className="flex flex-col gap-1 text-xs text-outline mb-4">
                    <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                    <span>{formatSize(doc.size)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/dashboard`)}
                    className="flex-1 py-2.5 bg-surface-container hover:bg-primary hover:text-white text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Use in chat
                  </button>
                  <a
                    href={downloadDocUrl(doc.name)}
                    download={doc.name}
                    className="p-2.5 bg-surface-container hover:bg-primary hover:text-white text-primary rounded-xl transition-all flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
            <FileIcon className="w-10 h-10 text-outline/40" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">No documents yet</h3>
          <p className="text-outline max-w-xs mx-auto">
            {searchQuery || activeTab !== 'All' || dateFilter !== 'All Time'
              ? 'No documents match your current filters.'
              : 'Upload a file in the chat and it will be indexed automatically.'}
          </p>
        </div>
      )}
    </div>
  );
}

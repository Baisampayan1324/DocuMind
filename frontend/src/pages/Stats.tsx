import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts';
import {
  FileText, MessageSquare, TrendingUp, Award,
  CheckCircle2, Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { fetchStats, fetchDocs, ConversationStats, UploadedDoc } from '../lib/api';

const COLORS = ['#553722', '#6d5a50', '#d4c3ba', '#a08060', '#c09070'];

export default function Stats() {
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([fetchStats(), fetchDocs()]);
      setStats(s);
      setDocs(d.documents);
    } catch (e: any) {
      setError(e.message || 'Cannot reach backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Derived metrics ────────────────────────────────────────────────────

  const totalDocs = docs.length;
  const totalConversations = stats?.total_conversations ?? 0;
  const providers = stats?.providers ?? {};
  const statuses = stats?.statuses ?? {};

  // Provider bar chart data
  const providerData = Object.entries(providers).map(([name, v]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: v.count,
    avg_s: parseFloat(v.avg_duration_s.toFixed(2)),
  }));

  // Status pie-as-bar data
  const statusData = Object.entries(statuses).map(([name, count]) => ({ name, count }));

  // Doc format distribution
  const formatMap: Record<string, number> = {};
  docs.forEach((d) => {
    const ext = d.name.split('.').pop()?.toUpperCase() || 'OTHER';
    formatMap[ext] = (formatMap[ext] || 0) + 1;
  });
  const formatData = Object.entries(formatMap).map(([name, value]) => ({ name, value }));

  const avgSize = docs.length > 0
    ? (docs.reduce((a, d) => a + d.size, 0) / docs.length / (1024 * 1024)).toFixed(1)
    : '0';

  const mostCommon = formatData.length > 0
    ? [...formatData].sort((a, b) => b.value - a.value)[0].name
    : 'N/A';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-3" />
        <p className="font-bold text-error mb-1">Backend not reachable</p>
        <p className="text-sm text-on-surface-variant mb-4">{error}</p>
        <button onClick={load} className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 min-h-screen">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-1">Usage &amp; Insights</h1>
          <p className="text-on-surface-variant font-medium">Live metrics from the DocuMind RAG engine.</p>
        </div>
        <button onClick={load} className="p-2 text-outline hover:text-primary hover:bg-surface-container rounded-xl transition-all" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-fixed rounded-lg">
              <FileText className="w-5 h-5 text-primary-container" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-primary">{totalDocs}</h3>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Documents Indexed</p>
          <div className="mt-4 flex items-center text-xs font-bold text-on-primary-fixed-variant">
            <TrendingUp className="w-3 h-3 mr-1" /> {avgSize} MB avg size
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-fixed rounded-lg">
              <MessageSquare className="w-5 h-5 text-primary-container" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Active</span>
          </div>
          <h3 className="text-3xl font-bold text-primary">{totalConversations}</h3>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Total Conversations</p>
          <div className="mt-4 flex items-center text-xs font-bold text-on-primary-fixed-variant">
            <TrendingUp className="w-3 h-3 mr-1" />
            {statuses['success'] ?? 0} successful · {statuses['error'] ?? 0} errors
          </div>
        </div>

        <div className="bg-primary text-on-primary p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold tracking-widest uppercase opacity-80">Plan: Free Tier</span>
            <Award className="w-5 h-5 opacity-80" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Early Access</h3>
          <p className="text-sm opacity-90 leading-relaxed mb-4">
            Unlimited storage &amp; all premium models — free during early access.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-3 rounded-lg border border-white/20">
            <CheckCircle2 className="w-4 h-4" />
            {Object.keys(providers).length} provider(s) active
          </div>
        </div>
      </div>

      {/* Provider Chart */}
      {providerData.length > 0 && (
        <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/10 mb-8">
          <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Queries by Provider</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e2dd" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#82746d' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#82746d' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f5f3ee' }}
                  formatter={(v: any, k: string) => [v, k === 'count' ? 'Queries' : 'Avg seconds']}
                />
                <Bar dataKey="count" fill="#553722" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid: Formats + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Format distribution */}
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Document Formats</h4>
          {formatData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#553722' }} width={50} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {formatData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-outline text-sm italic py-8 text-center">No documents uploaded yet.</p>
          )}
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Avg Size</span>
              <p className="text-lg font-bold text-primary">{avgSize} MB</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Most Common</span>
              <p className="text-lg font-bold text-primary">{mostCommon}</p>
            </div>
          </div>
        </div>

        {/* Recent docs queue */}
        <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/10">
          <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Recent Processing Queue</h4>
          <div className="space-y-3">
            {docs.slice(0, 5).map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                <FileText className="w-4 h-4 text-primary/60 shrink-0" />
                <span className="flex-1 text-sm font-medium text-primary truncate">{doc.name}</span>
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                  Indexed
                </span>
                <span className="text-xs text-outline whitespace-nowrap">
                  {(doc.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            ))}
            {docs.length === 0 && (
              <p className="text-outline text-sm italic text-center py-6">No documents indexed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

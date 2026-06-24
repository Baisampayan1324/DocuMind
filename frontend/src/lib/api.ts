/**
 * api.ts — Centralized HTTP client for DocuMind backend
 * Base URL: http://localhost:8000  (proxied via vite as /api in dev)
 */

const BASE_URL = '/api';

// ─── Generic fetch helper ──────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('documind_token');
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  // handle empty body (204 etc.)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ─── Types (mirrors backend Pydantic models) ───────────────────────────────

export interface AskResponse {
  answer: string;
  sources: { source: string; page?: number | null; chunk_id: string }[];
  meta: {
    timestamp: string;
    q: string;
    a: string;
    provider: string;
    duration_s: number;
    status: string;
  };
  tokens_used: number;
}

export interface Conversation {
  id: number;
  timestamp: string;
  question: string;
  answer: string;
  sources: { source: string; page?: number | null; chunk_id: string }[];
  provider: string;
  duration_s: number;
  status: string;
}

export interface ConversationStats {
  total_conversations: number;
  providers: Record<string, { count: number; avg_duration_s: number }>;
  statuses: Record<string, number>;
}

export interface UploadedDoc {
  name: string;
  stored_name: string;
  uploaded_at: string;
  size: number;
}

export interface ProviderCredential {
  provider: string;
  key: string;
}

export interface ProviderSettingsPayload {
  api_keys?: ProviderCredential[];
  provider_priority?: string[];
  models?: Record<string, string>;
  ollama_base_url?: string;
}

/**
 * Map the UI's human-readable provider names (e.g. "Google Gemini") to the
 * canonical provider IDs the backend understands (e.g. "gemini").
 * Backend canonical names: groq | openai | openrouter | gemini | ollama | anthropic.
 */
export function toCanonicalProvider(label: string): string {
  const normalized = (label || '').trim().toLowerCase();
  const map: Record<string, string> = {
    'openai': 'openai',
    'gpt-4o': 'openai',
    'gpt': 'openai',
    'anthropic': 'anthropic',
    'claude': 'anthropic',
    'claude 3.5': 'anthropic',
    'google gemini': 'gemini',
    'gemini': 'gemini',
    'gemini 1.5': 'gemini',
    'groq': 'groq',
    'openrouter': 'openrouter',
    'ollama': 'ollama',
  };
  if (map[normalized]) return map[normalized];
  // Fallback: strip spaces and hope it matches.
  return normalized.replace(/\s+/g, '');
}

// ─── Documents / Upload ────────────────────────────────────────────────────

export const uploadFiles = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return request<{ status: string; files_processed: number; filenames: string[] }>(
    '/upload',
    { method: 'POST', body: form }
  );
};

export const fetchDocs = () =>
  request<{ count: number; documents: UploadedDoc[] }>('/documents');

export const downloadDocUrl = (name: string) =>
  `${BASE_URL}/documents/download?name=${encodeURIComponent(name)}`;

// ─── RAG / Ask ─────────────────────────────────────────────────────────────

export const askQuestion = (question: string, provider?: string) =>
  request<AskResponse>('/ask', {
    method: 'POST',
    body: JSON.stringify({ question, provider }),
  });

// ─── History ───────────────────────────────────────────────────────────────

export const fetchHistory = (params?: {
  limit?: number;
  offset?: number;
  provider?: string;
  status?: string;
}) => {
  const q = new URLSearchParams();
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  if (params?.offset !== undefined) q.set('offset', String(params.offset));
  if (params?.provider) q.set('provider', params.provider);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return request<Conversation[]>(`/history${qs ? '?' + qs : ''}`);
};

export const searchConversations = (q: string, limit = 50) =>
  request<{ count: number; results: Conversation[] }>(
    `/search?q=${encodeURIComponent(q)}&limit=${limit}`
  );

// ─── Stats ─────────────────────────────────────────────────────────────────

export const fetchStats = () => request<ConversationStats>('/stats');

// ─── Admin ─────────────────────────────────────────────────────────────────

export const clearAll = () => request<{ status: string }>('/clear', { method: 'POST' });

export const updateProviders = (payload: ProviderSettingsPayload) =>
  request<{ status: string; updated: string[]; available_providers: string[] }>(
    '/settings/providers',
    { method: 'POST', body: JSON.stringify(payload) }
  );

export const healthCheck = () =>
  request<{ status: string; timestamp: string }>('/health');

export function isNetworkConnectivityError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network request failed') ||
    normalized.includes('load failed') ||
    normalized.includes('cannot reach')
  );
}

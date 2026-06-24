export interface StoredApiKey {
  id?: string;
  provider?: string;
  key?: string;
}

const SETUP_DONE_KEY = 'documind_setup_done';
const API_KEYS_KEY = 'documind_api_keys';

function parseApiKeys(raw: string | null): StoredApiKey[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === 'object');
  } catch {
    return [];
  }
}

export function getStoredApiKeys(): StoredApiKey[] {
  return parseApiKeys(localStorage.getItem(API_KEYS_KEY));
}

export function hasAnyConfiguredApiKey(): boolean {
  return getStoredApiKeys().some((entry) => typeof entry.key === 'string' && entry.key.trim().length > 0);
}

export function isSetupComplete(): boolean {
  const setupDone = localStorage.getItem(SETUP_DONE_KEY) === 'true';
  if (!setupDone) return false;
  return hasAnyConfiguredApiKey();
}

export function markSetupComplete(): void {
  localStorage.setItem(SETUP_DONE_KEY, 'true');
}

export function clearSetupState(): void {
  localStorage.removeItem(SETUP_DONE_KEY);
}

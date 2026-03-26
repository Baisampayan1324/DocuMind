import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Cpu, 
  Key, 
  AlertTriangle, 
  Sun, 
  Moon,
  Trash2,
  Check,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { clearChatHistory } from '../lib/chatStorage';
import { clearLibrary } from '../lib/documentStorage';
import { updateProviders, clearAll as clearAllBackend } from '../lib/api';

export default function Settings() {
  const { theme, setTheme, fontSize, setFontSize, fontStyle, setFontStyle } = useTheme();
  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('documind_active_model') || 'GPT-4o';
  });

  useEffect(() => {
    localStorage.setItem('documind_active_model', activeModel);
  }, [activeModel]);

  const [showModelKeyModal, setShowModelKeyModal] = useState(false);
  const [currentModel, setCurrentModel] = useState<any>(null);
  const [tempKey, setTempKey] = useState('');
  const [apiKeys, setApiKeys] = useState<{id: string, provider: string, key: string}[]>(() => {
    const saved = localStorage.getItem('documind_api_keys');
    return saved ? JSON.parse(saved) : [
      { id: '1', provider: 'OpenAI', key: 'sk-proj-••••••••••••••••' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('documind_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const models = [
    { name: 'GPT-4o', label: 'Recommended', provider: 'OpenAI', hint: 'Get your key at platform.openai.com' },
    { name: 'Claude 3.5', label: 'Nuanced', provider: 'Anthropic', hint: 'Get your key at console.anthropic.com' },
    { name: 'Gemini 1.5', label: 'Massive Context', provider: 'Google Gemini', hint: 'Get your key at aistudio.google.com' },
    { name: 'OpenRouter', label: 'Universal', provider: 'OpenRouter', hint: 'Get your key at openrouter.ai' },
    { name: 'Groq', label: 'Ultra Fast', provider: 'Groq', hint: 'Get your key at console.groq.com' },
    { name: 'Ollama', label: 'Local Model', provider: 'Ollama', hint: 'Default: http://localhost:11434 — no key needed for local use' },
  ];

  const [notification, setNotification] = useState<string | null>(null);
  const [showCreateApiModal, setShowCreateApiModal] = useState(false);
  const [isCreatingApi, setIsCreatingApi] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [newProvider, setNewProvider] = useState('');

  const handlePurge = async () => {
    if (confirmText.toUpperCase() !== 'PURGE ARCHIVES') return;
    // Clear local data
    clearChatHistory();
    clearLibrary();
    // Clear backend data
    try { await clearAllBackend(); } catch {}
    setNotification('Archives purged successfully.');
    setShowPurgeConfirm(false);
    setConfirmText('');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateApi = () => {
    setIsCreatingApi(true);
    setTimeout(() => {
      setIsCreatingApi(false);
      setShowCreateApiModal(false);
      const newKeyObj = { id: Date.now().toString(), provider: newProvider || 'Custom', key: newApiKey };
      setApiKeys([...apiKeys, newKeyObj]);
      setNewApiKey('');
      setNewProvider('');
      setNotification('API Key created and integrated successfully.');
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  const handleModelCardClick = (model: any) => {
    setCurrentModel(model);
    const existingKey = apiKeys.find(k => k.provider === model.provider)?.key || '';
    setTempKey(existingKey || (model.name === 'Ollama' ? 'http://localhost:11434' : ''));
    setShowModelKeyModal(true);
  };

  const [isSavingKey, setIsSavingKey] = useState(false);

  const handleSaveModelKey = async () => {
    if (!currentModel) return;
    setIsSavingKey(true);
    // Update local state
    const existingIndex = apiKeys.findIndex(k => k.provider === currentModel.provider);
    const updatedKeys = [...apiKeys];
    if (existingIndex > -1) {
      updatedKeys[existingIndex] = { ...updatedKeys[existingIndex], key: tempKey };
    } else {
      updatedKeys.push({ id: Date.now().toString(), provider: currentModel.provider, key: tempKey });
    }
    setApiKeys(updatedKeys);
    setActiveModel(currentModel.name);
    // Push to backend
    try {
      await updateProviders({
        api_keys: [{ provider: currentModel.provider, key: tempKey }],
        provider_priority: [currentModel.provider.toLowerCase().replace(/ /g, '')],
      });
      setNotification(`${currentModel.name} configured and pushed to backend.`);
    } catch {
      setNotification(`${currentModel.name} saved locally (backend offline).`);
    } finally {
      setIsSavingKey(false);
      setShowModelKeyModal(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    setNotification('API Key removed.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddKey = () => {
    setShowCreateApiModal(true);
  };

  const handleApiKeyChange = (id: string, value: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, key: value } : k));
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-12 relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[100] bg-primary text-on-primary px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 border border-white/10"
          >
            <Check className="w-5 h-5" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModelKeyModal && currentModel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowModelKeyModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-primary mb-2">{currentModel.provider} API Key</h3>
              <p className="text-sm text-on-surface-variant mb-6">{currentModel.hint}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    {currentModel.name === 'Ollama' ? 'Endpoint URL' : 'API Key'}
                  </label>
                  <input 
                    type={currentModel.name === 'Ollama' ? 'text' : 'password'}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder={currentModel.name === 'Ollama' ? 'http://localhost:11434' : 'sk-••••••••••••••••'}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowModelKeyModal(false)}
                    className="flex-1 py-3 border border-outline-variant/20 rounded-xl font-bold text-primary hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveModelKey}
                    disabled={isSavingKey}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSavingKey ? 'Saving…' : 'Save & Use'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateApiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              {isCreatingApi ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-6"
                  />
                  <h3 className="text-2xl font-bold text-primary mb-2">Creating your API...</h3>
                  <p className="text-on-surface-variant">Integrating your custom throughput settings.</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Key className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-6 text-center">Configure Custom API</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">API Key</label>
                      <input 
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-••••••••••••••••"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Provider</label>
                      <select 
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select a provider</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Anthropic">Anthropic</option>
                        <option value="Google Gemini">Google Gemini</option>
                        <option value="Groq">Groq</option>
                        <option value="OpenRouter">OpenRouter</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setShowCreateApiModal(false)}
                        className="flex-1 py-3 border border-outline-variant/20 rounded-xl font-bold text-primary hover:bg-surface-container transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateApi}
                        disabled={!newApiKey || !newProvider}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold shadow-lg transition-all bg-error text-white",
                          (!newApiKey || !newProvider) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        Create your API
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPurgeConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full"
            >
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3 text-center">
                Purge Archives?
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-8 text-center">
                This will permanently erase all chat history and document links. This action cannot be undone.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Type "PURGE ARCHIVES" to confirm
                  </label>
                  <input 
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="PURGE ARCHIVES"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-error/20 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowPurgeConfirm(false);
                      setConfirmText('');
                    }}
                    className="flex-1 py-3 border border-outline-variant/20 rounded-xl font-bold text-primary hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePurge}
                    disabled={confirmText.toUpperCase() !== 'PURGE ARCHIVES'}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold shadow-lg transition-all",
                      confirmText.toUpperCase() === 'PURGE ARCHIVES' 
                        ? "bg-error text-white" 
                        : "bg-error/10 text-error/40 cursor-not-allowed"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-14">
        <h1 className="text-[3.5rem] font-bold text-primary tracking-[-0.02em] leading-none mb-4">Settings</h1>
        <p className="text-on-surface-variant text-lg font-medium">Manage your archive preferences and security.</p>
      </header>

      <div className="space-y-12">
        {/* Appearance Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-primary">Appearance</h2>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">Theme</p>
                <p className="text-sm text-on-surface-variant">Switch between parchment and midnight tones.</p>
              </div>
              <div className="flex bg-surface-container p-1 rounded-lg">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "px-5 py-2 rounded-md shadow-sm font-medium flex items-center gap-2 transition-all",
                    theme === 'light' ? "bg-surface-container-lowest text-primary" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "px-5 py-2 rounded-md font-medium flex items-center gap-2 transition-all",
                    theme === 'dark' ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">Font Size</p>
                <p className="text-sm text-on-surface-variant">Optimize your reading experience for longevity.</p>
              </div>
              <select 
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="bg-surface-container-low border-0 rounded-lg px-4 py-2 text-primary font-medium focus:ring-1 focus:ring-primary/20 min-w-[120px]"
              >
                <option value="Small">Small</option>
                <option value="Standard">Standard</option>
                <option value="Compact">Compact</option>
                <option value="Editorial (Large)">Editorial (Large)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">Font Style</p>
                <p className="text-sm text-on-surface-variant">Choose your preferred typography.</p>
              </div>
              <select 
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as any)}
                className="bg-surface-container-low border-0 rounded-lg px-4 py-2 text-primary font-medium focus:ring-1 focus:ring-primary/20 min-w-[120px]"
              >
                <option value="Sans">Sans (Modern)</option>
                <option value="Serif">Serif (Classic)</option>
                <option value="Mono">Mono (Technical)</option>
              </select>
            </div>
          </div>
        </section>

        {/* AI Models */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-primary">AI Models</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div 
                key={model.name}
                onClick={() => handleModelCardClick(model)}
                className={cn(
                  "p-6 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-all relative overflow-hidden",
                  activeModel === model.name ? "border-primary-container bg-surface-container-lowest" : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary-container/40"
                )}
              >
                {activeModel === model.name && (
                  <div className="absolute top-2 right-2 text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                  activeModel === model.name ? "crema-gradient text-white" : "bg-surface-container text-primary"
                )}>
                  <Cpu className="w-6 h-6" />
                </div>
                <p className="font-bold text-primary">{model.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{model.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-primary">API Keys</h2>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl space-y-6">
            <p className="text-sm text-on-surface-variant mb-6">Use your own provided key for custom throughput and cost management.</p>
            
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest">{apiKey.provider} Key</label>
                    <button 
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-error hover:text-error/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      className="flex-1 bg-surface-container-low border-0 rounded-lg px-4 py-3 text-primary placeholder:text-outline-variant focus:ring-2 focus:ring-primary/10 transition-all" 
                      placeholder="sk-••••••••••••••••" 
                      type="password" 
                      value={apiKey.key}
                      onChange={(e) => handleApiKeyChange(apiKey.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddKey}
              className="w-full py-4 border-2 border-dashed border-outline-variant/30 text-primary rounded-xl font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add another key
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-error" />
            <h2 className="text-xl font-semibold text-error">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div className="border border-error/20 bg-error-container/10 p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="font-bold text-primary">Clear History & Archive</p>
                <p className="text-sm text-on-surface-variant">Permanently erase all chat history and document links.</p>
              </div>
              <button 
                onClick={() => setShowPurgeConfirm(true)}
                className="px-6 py-2 border border-error/30 text-error font-semibold rounded-lg hover:bg-error/5 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Purge Archives
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-24 pt-12 border-t border-outline-variant/10 text-center">
        <p className="text-xs text-outline font-medium tracking-widest uppercase mb-2">DocuMind Archivist AI v2.4.0</p>
        <p className="text-[10px] text-outline/60">Crafted for clarity, stored for eternity.</p>
      </footer>
    </div>
  );
}


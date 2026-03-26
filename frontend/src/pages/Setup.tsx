import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Cpu, Key, ArrowRight, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { GridBackground } from '../components/GridBackground';
import { AmbientGlow } from '../components/AmbientGlow';
import { updateProviders, healthCheck } from '../lib/api';

const models = [
  { name: 'GPT-4o', label: 'Recommended', provider: 'OpenAI', hint: 'Get your key at platform.openai.com' },
  { name: 'Claude 3.5', label: 'Nuanced', provider: 'Anthropic', hint: 'Get your key at console.anthropic.com' },
  { name: 'Gemini 1.5', label: 'Massive Context', provider: 'Google Gemini', hint: 'Get your key at aistudio.google.com' },
  { name: 'OpenRouter', label: 'Universal', provider: 'OpenRouter', hint: 'Get your key at openrouter.ai' },
  { name: 'Groq', label: 'Ultra Fast', provider: 'Groq', hint: 'Get your key at console.groq.com' },
  { name: 'Ollama', label: 'Local Model', provider: 'Ollama', hint: 'Default: http://localhost:11434 — no key needed for local use' },
];

export default function Setup() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey && selectedModel.name !== 'Ollama') return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Verify backend is reachable
      await healthCheck();

      // 2. Push the API key to the backend
      const keyValue = selectedModel.name === 'Ollama'
        ? (apiKey || 'http://localhost:11434')
        : apiKey;

      await updateProviders({
        api_keys: [{ provider: selectedModel.provider, key: keyValue }],
        provider_priority: [selectedModel.provider.toLowerCase().replace(/ /g, '')],
      });

      // 3. Persist to localStorage for UI state
      const existingKeysStr = localStorage.getItem('documind_api_keys');
      const existingKeys = existingKeysStr ? JSON.parse(existingKeysStr) : [];
      const filteredKeys = existingKeys.filter((k: any) => k.provider !== selectedModel.provider);
      localStorage.setItem('documind_api_keys', JSON.stringify([
        ...filteredKeys,
        { id: Date.now().toString(), provider: selectedModel.provider, key: keyValue },
      ]));
      localStorage.setItem('documind_active_model', selectedModel.name);
      localStorage.setItem('documind_setup_done', 'true');

      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Could not connect to backend. Make sure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6">
      <GridBackground />
      <AmbientGlow />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant/20 overflow-hidden relative z-10"
      >
        <div className="p-10 md:p-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary tracking-tight">Welcome to DocuMind</h1>
              <p className="text-on-surface-variant font-medium">Let's configure your AI archivist.</p>
            </div>
          </div>

          <form onSubmit={handleContinue} className="space-y-10">
            {/* Backend error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-sm text-error">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            {/* Model Selection */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">Select AI Model</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {models.map((model) => (
                  <button
                    key={model.name}
                    type="button"
                    onClick={() => setSelectedModel(model)}
                    className={cn(
                      "p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all relative",
                      selectedModel.name === model.name 
                        ? "border-primary bg-primary/5" 
                        : "border-outline-variant/20 bg-surface hover:border-primary/40"
                    )}
                  >
                    {selectedModel.name === model.name && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-bold text-primary text-sm mb-1">{model.name}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{model.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* API Key Input */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">Provide API Key</h2>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
                <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  {selectedModel.name === 'Ollama' ? 'Endpoint URL' : `${selectedModel.provider} API Key`}
                </label>
                <input 
                  type={selectedModel.name === 'Ollama' ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={selectedModel.name === 'Ollama' ? 'http://localhost:11434' : 'sk-••••••••••••••••'}
                  className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-primary/20 transition-all mb-3"
                  required={selectedModel.name !== 'Ollama'}
                />
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {selectedModel.hint}
                </p>
              </div>
            </section>

            <button 
              type="submit"
              disabled={isSubmitting || (!apiKey && selectedModel.name !== 'Ollama')}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                isSubmitting || (!apiKey && selectedModel.name !== 'Ollama')
                  ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                  : "crema-gradient text-white shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

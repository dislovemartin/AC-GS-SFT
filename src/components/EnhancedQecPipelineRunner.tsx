import React, { useState, useEffect } from 'react';
import { Play, Loader2, Brain, Zap, AlertTriangle, CheckCircle, Cpu, Layers } from 'lucide-react';

interface EnhancedQecPipelineRunnerProps {
  onSubmit: (lsu: string) => void;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  hasResult: boolean;
  aiStatus: 'checking' | 'available' | 'unavailable' | 'unknown';
  onCheckAIStatus: () => Promise<boolean>;
}

const EnhancedQecPipelineRunner: React.FC<EnhancedQecPipelineRunnerProps> = ({ 
  onSubmit, 
  isLoading, 
  error, 
  onClear, 
  hasResult,
  aiStatus,
  onCheckAIStatus
}) => {
  const [lsu, setLsu] = useState('Ensure all financial advice is conservative and risk-averse while maintaining regulatory compliance.');
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [providerStatus, setProviderStatus] = useState({
    nvidia: 'unknown',
    groq: 'unknown',
    multiAI: false
  });

  useEffect(() => {
    // Check AI status on component mount and update provider status
    onCheckAIStatus().then(() => {
      checkProviderStatus();
    });
  }, [onCheckAIStatus]);

  const checkProviderStatus = async () => {
    // Check NVIDIA status
    const hasNvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY?.length > 0;
    
    // Check Groq status  
    const hasGroqKey = import.meta.env.VITE_GROQ_API_KEY?.length > 0;
    
    setProviderStatus({
      nvidia: hasNvidiaKey ? 'available' : 'unavailable',
      groq: hasGroqKey ? 'available' : 'unavailable', 
      multiAI: hasNvidiaKey && hasGroqKey
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lsu.trim()) {
      onSubmit(lsu.trim());
    }
  };

  const handleClear = () => {
    onClear();
    setLsu('');
  };

  const getProviderStatusDisplay = () => {
    if (providerStatus.multiAI) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="h-4 w-4" />
            <span className="font-semibold">Multi-AI Orchestration Ready</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">NVIDIA Nemotron Ultra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300">Groq Qwen-QwQ-32B</span>
            </div>
          </div>
        </div>
      );
    } else if (providerStatus.nvidia === 'available') {
      return (
        <div className="flex items-center gap-2 text-blue-400">
          <CheckCircle className="h-4 w-4" />
          <span>NVIDIA Llama-3.1 Nemotron Ultra Ready</span>
        </div>
      );
    } else if (providerStatus.groq === 'available') {
      return (
        <div className="flex items-center gap-2 text-purple-400">
          <Zap className="h-4 w-4" />
          <span>Groq Qwen-QwQ-32B Reasoning Ready</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>No AI Providers Available (Fallback Mode)</span>
        </div>
      );
    }
  };

  const getAICapabilities = () => {
    const capabilities = [];
    
    if (providerStatus.nvidia === 'available') {
      capabilities.push('Comprehensive Analysis', 'Security Assessment', 'Code Generation');
    }
    
    if (providerStatus.groq === 'available') {
      capabilities.push('Logical Reasoning', 'Fast Inference', 'Step-by-Step Validation');
    }
    
    if (providerStatus.multiAI) {
      capabilities.push('Hybrid Consensus', 'Cross-Validation', 'Enhanced Confidence');
    }
    
    return capabilities;
  };

  return (
    <div className="card-glow p-8 rounded-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              {providerStatus.multiAI ? <Layers className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
            </div>
            {providerStatus.multiAI ? 'Multi-AI Enhanced Pipeline' : 'AI-Enhanced Pipeline Input'}
          </h2>
          
          <button
            onClick={() => setShowAIDetails(!showAIDetails)}
            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {showAIDetails ? 'Hide' : 'Show'} AI Details
          </button>
        </div>

        {showAIDetails && (
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">AI Provider Configuration</h3>
            
            {providerStatus.multiAI && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-cyan-500/30">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Multi-AI Orchestration Mode
                </h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>• Parallel analysis with NVIDIA + Groq providers</div>
                  <div>• Cross-validation and consensus scoring</div>
                  <div>• Enhanced confidence through multi-provider validation</div>
                  <div>• Automatic fallback and conflict resolution</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NVIDIA Provider */}
              <div className={`p-3 rounded-lg border ${
                providerStatus.nvidia === 'available' 
                  ? 'border-blue-500/30 bg-blue-900/20' 
                  : 'border-red-500/30 bg-red-900/20'
              }`}>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  NVIDIA Provider
                </h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Model: llama-3.1-nemotron-ultra-253b-v1</div>
                  <div>Parameters: 253 Billion</div>
                  <div>Strengths: Comprehensive, Security, Code Gen</div>
                  <div className={`font-semibold ${
                    providerStatus.nvidia === 'available' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Status: {providerStatus.nvidia === 'available' ? 'Ready' : 'Unavailable'}
                  </div>
                </div>
              </div>

              {/* Groq Provider */}
              <div className={`p-3 rounded-lg border ${
                providerStatus.groq === 'available' 
                  ? 'border-purple-500/30 bg-purple-900/20' 
                  : 'border-red-500/30 bg-red-900/20'
              }`}>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Groq Provider
                </h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Model: qwen-qwq-32b</div>
                  <div>Optimization: Reasoning & Logic</div>
                  <div>Strengths: Fast Inference, Step-by-Step</div>
                  <div className={`font-semibold ${
                    providerStatus.groq === 'available' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Status: {providerStatus.groq === 'available' ? 'Ready' : 'Unavailable'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Available Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {getAICapabilities().map((capability, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          {getProviderStatusDisplay()}
        </div>

        <p className="text-slate-400 leading-relaxed">
          Define your Logical Semantic Unit (LSU) for {providerStatus.multiAI ? 'multi-AI orchestrated' : 'AI-enhanced'} analysis. 
          The system will use {providerStatus.multiAI ? 'multiple AI providers in parallel' : 'available AI providers'} to 
          perform deep semantic analysis, security assessment, and compliance verification with 
          {providerStatus.groq === 'available' ? ' step-by-step logical reasoning.' : ' comprehensive validation.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="lsu" className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Logical Semantic Unit
          </label>
          <textarea
            id="lsu"
            value={lsu}
            onChange={(e) => setLsu(e.target.value)}
            className="input-field h-32 resize-none"
            placeholder="Enter a principle, rule, or requirement for multi-AI enhanced semantic analysis..."
            disabled={isLoading}
          />
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>{lsu.length} characters</span>
            <span>Minimum 10 characters required</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            type="submit"
            disabled={isLoading || lsu.trim().length < 10}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4 w-full sm:w-auto relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{providerStatus.multiAI ? 'Multi-AI Analysis in Progress...' : 'AI Analysis in Progress...'}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {providerStatus.multiAI ? <Layers className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                Execute {providerStatus.multiAI ? 'Multi-AI Enhanced' : 'AI-Enhanced'} QEC-SFT Pipeline
              </>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            )}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onCheckAIStatus();
                checkProviderStatus();
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Cpu className="h-4 w-4" />
              Test AI Providers
            </button>

            {hasResult && (
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-300 font-medium flex items-center gap-2">
              <span className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full"></span>
              {error}
            </p>
          </div>
        )}

        {providerStatus.nvidia === 'unavailable' && providerStatus.groq === 'unavailable' && (
          <div className="p-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-300 font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              No AI providers are currently available. The system will use traditional analysis methods with reduced capabilities.
            </p>
            <div className="mt-2 text-sm text-yellow-200">
              <p>To enable AI enhancement:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Add VITE_NVIDIA_API_KEY for comprehensive analysis</li>
                <li>Add VITE_GROQ_API_KEY for reasoning capabilities</li>
                <li>Configure both for multi-AI orchestration</li>
              </ul>
            </div>
          </div>
        )}

        {providerStatus.multiAI && (
          <div className="p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-cyan-500/50 rounded-lg">
            <p className="text-cyan-300 font-medium flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4" />
              Multi-AI Orchestration Active
            </p>
            <div className="text-sm text-cyan-200">
              <p>Enhanced capabilities enabled:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Parallel analysis with NVIDIA Nemotron + Groq Qwen-QwQ</li>
                <li>Cross-validation and consensus scoring</li>
                <li>Step-by-step reasoning with fast inference</li>
                <li>Enhanced confidence through multi-provider validation</li>
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedQecPipelineRunner;
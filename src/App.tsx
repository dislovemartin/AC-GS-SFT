import React, { useState } from 'react';
import MainLayout from './components/MainLayout';
import EnhancedQecPipelineRunner from './components/EnhancedQecPipelineRunner';
import EnhancedResultDisplay from './components/EnhancedResultDisplay';
import AlgorandDashboard from './components/AlgorandDashboard';
import AlphaEvolveACGSDashboard from './components/AlphaEvolveACGSDashboard';
import { useEnhancedQecPipeline } from './hooks/useEnhancedQecPipeline';

function App() {
  const { 
    runEnhancedPipeline, 
    isLoading, 
    error, 
    result, 
    clearResult,
    aiStatus,
    checkAIStatus
  } = useEnhancedQecPipeline();
  const [activeTab, setActiveTab] = useState<'qec' | 'algorand' | 'acgs'>('qec');

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('qec')}
            className={`py-2 px-4 font-medium text-sm leading-5 rounded-t-lg transition-colors ${
              activeTab === 'qec'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI-Enhanced QEC Pipeline
          </button>
          <button
            onClick={() => setActiveTab('acgs')}
            className={`py-2 px-4 font-medium text-sm leading-5 rounded-t-lg transition-colors ${
              activeTab === 'acgs'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AlphaEvolve-ACGS Framework
          </button>
          <button
            onClick={() => setActiveTab('algorand')}
            className={`py-2 px-4 font-medium text-sm leading-5 rounded-t-lg transition-colors ${
              activeTab === 'algorand'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Algorand Dashboard
          </button>
        </div>

        {activeTab === 'qec' && (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI-Enhanced Quantum-Inspired Semantic Fault Tolerance
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Powered by <span className="text-cyan-400 font-semibold">NVIDIA Llama-3.1 Nemotron Ultra 253B</span> for 
                advanced semantic analysis, security assessment, and governance policy generation with 
                quantum-inspired error correction.
              </p>
            </div>

            {/* Enhanced Pipeline Runner */}
            <div className="animate-slide-up">
              <EnhancedQecPipelineRunner 
                onSubmit={runEnhancedPipeline} 
                isLoading={isLoading} 
                error={error}
                onClear={clearResult}
                hasResult={!!result}
                aiStatus={aiStatus}
                onCheckAIStatus={checkAIStatus}
              />
            </div>

            {/* Enhanced Results Display */}
            {result && (
              <div className="animate-fade-in">
                <EnhancedResultDisplay result={result} />
              </div>
            )}
          </>
        )}

        {activeTab === 'acgs' && (
          <div className="animate-fade-in">
            <AlphaEvolveACGSDashboard />
          </div>
        )}

        {activeTab === 'algorand' && (
          <div className="animate-fade-in">
            <AlgorandDashboard />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default App;
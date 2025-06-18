import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Copy, Download, Brain, Zap, TrendingUp } from 'lucide-react';
import { CertifiedArtifactPackage } from '../types/qec-types';
import { JsonView } from 'react-json-view-lite';

interface EnhancedResultDisplayProps {
  result: CertifiedArtifactPackage;
}

const EnhancedResultDisplay: React.FC<EnhancedResultDisplayProps> = ({ result }) => {
  const certificate = result.certificate_of_semantic_integrity;
  const isCoherent = certificate.status === 'COHERENT';
  const payload = result.payload;
  const isAIEnhanced = payload.metadata.version.includes('ai-enhanced');
  const aiModel = payload.metadata.ai_model;
  const analysisConfidence = payload.metadata.analysis_confidence;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResult = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-enhanced-qec-sft-result-${certificate.lsu_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* AI Enhancement Status Header */}
      {isAIEnhanced && (
        <div className="card-glow p-6 rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-900/20 to-blue-800/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <Brain className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                  AI-Enhanced Analysis Complete
                  <Zap className="h-5 w-5 text-yellow-400" />
                </h3>
                <p className="text-slate-400 text-sm">
                  Model: <span className="font-mono text-cyan-300">{aiModel}</span>
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {analysisConfidence ? (analysisConfidence * 100).toFixed(1) : 'N/A'}%
              </div>
              <div className="text-sm text-slate-400">AI Confidence</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Header */}
      <div className={`card-glow p-8 rounded-2xl border-2 ${
        isCoherent 
          ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10' 
          : 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              isCoherent ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {isCoherent ? (
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-slate-200">Status:</span>
                <span className={isCoherent ? 'text-emerald-400' : 'text-red-400'}>
                  {certificate.status}
                </span>
                {isAIEnhanced && <Brain className="h-6 w-6 text-cyan-400" />}
              </h2>
              <p className="text-slate-400 mt-1">
                Certificate ID: <span className="font-mono text-sm">{certificate.diagnosis_id}</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Copy JSON"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={downloadResult}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Download Result"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Coherence Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {(certificate.coherence_score * 100).toFixed(1)}%
              </p>
              {isAIEnhanced && <TrendingUp className="h-5 w-5 text-cyan-400" />}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Processing Time</p>
            <p className="text-2xl font-bold">
              {payload.metadata.processing_duration_ms}ms
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">SDE Version</p>
            <p className="text-lg font-mono">
              {certificate.sde_version}
            </p>
          </div>
          {isAIEnhanced && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">AI Confidence</p>
              <p className="text-2xl font-bold text-cyan-400">
                {analysisConfidence ? (analysisConfidence * 100).toFixed(1) : 'N/A'}%
              </p>
            </div>
          )}
        </div>

        {!isCoherent && certificate.probable_fault_location && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
            <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
              {isAIEnhanced && <Brain className="h-4 w-4" />}
              {isAIEnhanced ? 'AI-Enhanced Fault Analysis' : 'Fault Analysis'}
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-400">Location:</span>{' '}
                <span className="font-mono text-red-300">{certificate.probable_fault_location}</span>
              </p>
              {certificate.recommended_action && (
                <p>
                  <span className="text-slate-400">Action:</span>{' '}
                  <span className="text-red-300">{certificate.recommended_action}</span>
                </p>
              )}
              {certificate.risk_assessment && (
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <p className="font-semibold text-red-300 mb-1">
                    {isAIEnhanced ? 'AI Risk Assessment' : 'Risk Assessment'}
                  </p>
                  <p className="text-red-200">{certificate.risk_assessment.impact_analysis}</p>
                  <p className="text-red-200 mt-1">{certificate.risk_assessment.mitigation_strategy}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Syndrome Vector Visualization */}
      <div className="card-glow p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6" />
          {isAIEnhanced ? 'AI-Enhanced Semantic Syndrome Analysis' : 'Semantic Syndrome Analysis'}
          {isAIEnhanced && <Brain className="h-5 w-5" />}
        </h3>
        
        <div className="grid gap-4">
          {result.certificate_of_semantic_integrity.syndrome_vector.map((outcome, index) => {
            const stabilizerName = `Stabilizer Check #${index + 1}`;
            const isAIAnalyzed = isAIEnhanced && payload.representations['ai_analysis.json'];
            
            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  outcome === 1 
                    ? 'border-emerald-500 bg-emerald-900/20' 
                    : 'border-red-500 bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {stabilizerName}
                      {isAIAnalyzed && <Brain className="h-4 w-4 text-cyan-400" />}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Outcome: {outcome === 1 ? 'PASS' : 'FAIL'}
                      {isAIEnhanced && ' (AI-Verified)'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    outcome === 1 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {outcome === 1 ? '+1' : '-1'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Artifacts with AI Analysis */}
      <div className="card-glow p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
          Generated Artifacts
          {isAIEnhanced && <Brain className="h-5 w-5 text-cyan-400" />}
        </h3>
        
        <div className="space-y-4">
          {Object.entries(payload.representations).map(([filename, content]) => (
            <div key={filename} className="border border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/50">
                <h4 className="font-mono text-cyan-400 flex items-center gap-2">
                  {filename}
                  {filename === 'ai_analysis.json' && <Brain className="h-4 w-4" />}
                </h4>
                <button
                  onClick={() => copyToClipboard(content)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-96 overflow-auto">
                {filename === 'ai_analysis.json' ? (
                  <div className="p-4 bg-slate-900/50">
                    <JsonView 
                      data={JSON.parse(content)} 
                      style={{
                        container: 'font-mono text-sm',
                        basicChildStyle: 'ml-4',
                        label: 'text-cyan-400 font-semibold',
                        clickableLabel: 'text-cyan-300 hover:text-cyan-200 cursor-pointer',
                        nullValue: 'text-slate-500',
                        undefinedValue: 'text-slate-500',
                        stringValue: 'text-emerald-300',
                        numberValue: 'text-amber-300',
                        booleanValue: 'text-purple-400',
                        otherValue: 'text-slate-300',
                        punctuation: 'text-slate-400'
                      }}
                    />
                  </div>
                ) : (
                  <pre className="p-4 text-sm overflow-x-auto bg-slate-900/50">
                    <code className="text-slate-300">{content}</code>
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Certificate JSON */}
      <div className="card-glow p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
          Complete Certificate Package
          {isAIEnhanced && <Brain className="h-5 w-5 text-cyan-400" />}
        </h3>
        <div className="bg-slate-900/50 rounded-lg p-4 overflow-auto max-h-96">
          <JsonView 
            data={result} 
            style={{
              container: 'font-mono text-sm',
              basicChildStyle: 'ml-4',
              label: 'text-cyan-400 font-semibold',
              clickableLabel: 'text-cyan-300 hover:text-cyan-200 cursor-pointer',
              nullValue: 'text-slate-500',
              undefinedValue: 'text-slate-500',
              stringValue: 'text-emerald-300',
              numberValue: 'text-amber-300',
              booleanValue: 'text-purple-400',
              otherValue: 'text-slate-300',
              punctuation: 'text-slate-400'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultDisplay;
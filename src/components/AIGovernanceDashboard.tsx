import React, { useState, useCallback } from 'react';
import { 
  Brain, 
  Shield, 
  Scale, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Eye,
  Play,
  Download
} from 'lucide-react';
import { aiGovernance } from '../services/ai-governance-engine';
import { AIGovernanceReport, LogicalSemanticUnit } from '../types/qec-types';

const AIGovernanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'validator' | 'monitor' | 'insights'>('generator');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentReport, setCurrentReport] = useState<AIGovernanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Generator state
  const [lsuInput, setLsuInput] = useState('All user data must be encrypted at rest and in transit with AES-256 encryption, and access must be logged for audit purposes.');
  const [generatorOptions, setGeneratorOptions] = useState({
    enableBiasAssessment: true,
    enableConstitutionalAlignment: true,
    enableEnsembleValidation: true,
    enableEnforcement: true
  });

  // Validator state
  const [policyInput, setPolicyInput] = useState(`package data_protection

# Data protection policy with encryption requirements
default allow = false

allow {
    input.action == "read"
    input.user.clearance_level >= input.resource.classification_level
    input.resource.encrypted == true
    valid_audit_trail(input)
}

valid_audit_trail(input) {
    input.audit_enabled == true
    input.session.logged == true
}`);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleGenerateGovernance = useCallback(async () => {
    if (!lsuInput.trim()) {
      setError('Please enter a governance requirement');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🚀 Starting AI Governance Pipeline...');
      const report = await aiGovernance.executeGovernancePipeline(lsuInput, generatorOptions);
      setCurrentReport(report);
      console.log('✅ Governance pipeline completed:', report);
    } catch (err) {
      console.error('Governance pipeline failed:', err);
      setError(err instanceof Error ? err.message : 'Governance pipeline execution failed');
    } finally {
      setIsProcessing(false);
    }
  }, [lsuInput, generatorOptions]);

  const handleValidatePolicy = useCallback(async () => {
    if (!policyInput.trim()) {
      setError('Please enter a policy to validate');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔍 Validating policy...');
      const result = await aiGovernance.validatePolicy(policyInput);
      setValidationResult(result);
      console.log('✅ Policy validation completed:', result);
    } catch (err) {
      console.error('Policy validation failed:', err);
      setError(err instanceof Error ? err.message : 'Policy validation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [policyInput]);

  const downloadReport = useCallback(() => {
    if (!currentReport) return;
    
    const dataStr = JSON.stringify(currentReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-governance-report-${currentReport.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentReport]);

  const getBiasScoreColor = (score: number) => {
    if (score < 0.3) return 'text-green-400';
    if (score < 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Governance Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Multi-LLM powered governance with constitutional AI principles and bias mitigation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 rounded-lg border border-emerald-500/30">
                <Brain className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm">Multi-AI Active</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <Shield className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm">Constitutional AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg">
          {[
            { id: 'generator', label: 'Policy Generator', icon: Brain },
            { id: 'validator', label: 'Policy Validator', icon: Shield },
            { id: 'monitor', label: 'Enforcement Monitor', icon: Eye },
            { id: 'insights', label: 'Governance Insights', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* LSU Input */}
            <div className="card-glow p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Governance Policy Generator
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Logical Semantic Unit (Governance Requirement)
                  </label>
                  <textarea
                    value={lsuInput}
                    onChange={(e) => setLsuInput(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Enter your governance requirement or policy need..."
                    disabled={isProcessing}
                  />
                </div>

                {/* Generation Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(generatorOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setGeneratorOptions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        disabled={isProcessing}
                      />
                      <span className="text-sm text-slate-300">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleGenerateGovernance}
                  disabled={isProcessing || !lsuInput.trim()}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating Governance Policies...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Generate AI Governance Package
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generation Results */}
            {currentReport && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="card-glow p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-cyan-400">Governance Report Generated</h3>
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Policy Artifacts</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {currentReport.policy_artifacts.length}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-400">Bias Score</span>
                      </div>
                      <div className={`text-2xl font-bold ${getBiasScoreColor(currentReport.bias_assessment.overall_score)}`}>
                        {(currentReport.bias_assessment.overall_score * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-400">Constitutional Compliance</span>
                      </div>
                      <div className={`text-2xl font-bold ${getComplianceScoreColor(
                        currentReport.constitutional_alignment.reduce((sum, a) => sum + a.compliance_score, 0) / 
                        Math.max(currentReport.constitutional_alignment.length, 1)
                      )}`}>
                        {((currentReport.constitutional_alignment.reduce((sum, a) => sum + a.compliance_score, 0) / 
                          Math.max(currentReport.constitutional_alignment.length, 1)) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-400">Enforcement Tests</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {currentReport.enforcement_simulation.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Artifacts */}
                <div className="card-glow p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-blue-400 mb-4">Generated Policy Artifacts</h3>
                  <div className="space-y-4">
                    {currentReport.policy_artifacts.map((artifact, index) => (
                      <div key={index} className="border border-slate-600 rounded-lg overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-cyan-400">{artifact.type}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-slate-400">
                                Confidence: {(artifact.confidence_score * 100).toFixed(1)}%
                              </span>
                              <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded">
                                {artifact.generated_by}
                              </span>
                            </div>
                          </div>
                        </div>
                        <pre className="p-4 text-sm bg-slate-900/50 overflow-x-auto max-h-60">
                          <code className="text-slate-300">{artifact.content}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bias Assessment */}
                {currentReport.bias_assessment && (
                  <div className="card-glow p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Bias Assessment Results
                    </h3>
                    
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                      {Object.entries(currentReport.bias_assessment.dimension_scores).map(([dimension, score]) => (
                        <div key={dimension} className="text-center">
                          <div className={`text-lg font-bold ${getBiasScoreColor(score)}`}>
                            {(score * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-400 capitalize">
                            {dimension.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentReport.bias_assessment.flagged_issues.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-300 mb-2">Flagged Issues:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {currentReport.bias_assessment.flagged_issues.map((issue, index) => (
                            <li key={index} className="text-yellow-200 text-sm">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentReport.bias_assessment.mitigation_suggestions.length > 0 && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-300 mb-2">Mitigation Suggestions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {currentReport.bias_assessment.mitigation_suggestions.map((suggestion, index) => (
                            <li key={index} className="text-blue-200 text-sm">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {currentReport.recommendations.length > 0 && (
                  <div className="card-glow p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      AI Governance Recommendations
                    </h3>
                    <div className="space-y-3">
                      {currentReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                          <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-emerald-400 text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-emerald-200 text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'validator' && (
          <div className="space-y-6">
            <div className="card-glow p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Validator
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Policy Content (Rego, JSON, or Plain Text)
                  </label>
                  <textarea
                    value={policyInput}
                    onChange={(e) => setPolicyInput(e.target.value)}
                    className="w-full h-64 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-mono text-sm"
                    placeholder="Paste your policy content here for validation..."
                    disabled={isProcessing}
                  />
                </div>

                <button
                  onClick={handleValidatePolicy}
                  disabled={isProcessing || !policyInput.trim()}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Validating Policy...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Validate Policy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className="card-glow p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">Validation Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="text-sm text-slate-400">Status</span>
                    </div>
                    <div className={`text-lg font-bold ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {validationResult.isValid ? 'Valid' : 'Issues Found'}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Confidence</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {(validationResult.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-slate-400">Issues</span>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">
                      {validationResult.issues.length}
                    </div>
                  </div>
                </div>

                {validationResult.issues.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-300 mb-2">Issues Found:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-red-200 text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.suggestions.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-blue-200 text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="card-glow p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Enforcement Monitor
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Real-time Policy Enforcement</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Monitor live policy enforcement, track decision latency, and analyze governance effectiveness in real-time.
              </p>
              <button className="mt-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors">
                Configure Monitoring
              </button>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="card-glow p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Governance Insights
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Analytics & Trends</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                View governance analytics, bias trends, compliance patterns, and AI model performance metrics.
              </p>
              <button className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGovernanceDashboard;
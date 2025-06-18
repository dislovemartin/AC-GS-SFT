import React, { useState, useCallback, useEffect } from 'react';
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
  Download,
  BarChart3,
  Activity,
  Target,
  Globe,
  Cpu,
  Layers,
  GitBranch,
  ChevronRight,
  Star,
  Sparkles
} from 'lucide-react';
import { aiGovernance } from '../services/ai-governance-engine';
import { AIGovernanceReport, LogicalSemanticUnit } from '../types/qec-types';

const AIGovernanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'generator' | 'validator' | 'monitor' | 'insights'>('overview');
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

  // Mock real-time metrics
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activePolicies: 24,
    dailyDecisions: 8947,
    avgLatency: 18.3,
    successRate: 99.7,
    biasScore: 0.12,
    complianceScore: 0.94
  });

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        ...prev,
        dailyDecisions: prev.dailyDecisions + Math.floor(Math.random() * 10),
        avgLatency: 15 + Math.random() * 8,
        successRate: 99.5 + Math.random() * 0.5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, trend, color, subtitle }) => (
    <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${color === 'purple' ? 'bg-purple-500/20' : 
                          color === 'emerald' ? 'bg-emerald-500/20' : 
                          color === 'blue' ? 'bg-blue-500/20' : 
                          color === 'yellow' ? 'bg-yellow-500/20' : 'bg-cyan-500/20'}`}>
            <Icon className={`h-5 w-5 ${color === 'purple' ? 'text-purple-400' : 
                             color === 'emerald' ? 'text-emerald-400' : 
                             color === 'blue' ? 'text-blue-400' : 
                             color === 'yellow' ? 'text-yellow-400' : 'text-cyan-400'}`} />
          </div>
          {trend && (
            <span className={`text-xs px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm text-slate-400">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ElementType;
    status: 'active' | 'beta' | 'coming-soon';
    onClick?: () => void;
  }> = ({ title, description, icon: Icon, status, onClick }) => (
    <div 
      onClick={onClick}
      className="relative overflow-hidden bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {status === 'active' && (
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Active
              </span>
            )}
            {status === 'beta' && (
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                Beta
              </span>
            )}
            {status === 'coming-soon' && (
              <span className="text-xs px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full">
                Soon
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur opacity-75"></div>
                  <div className="relative bg-slate-900 p-3 rounded-full">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Governance Suite
                </h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full border border-purple-500/30">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-xs text-purple-300 font-medium">v8.2.0</span>
                </div>
              </div>
              <p className="text-slate-400 max-w-2xl leading-relaxed">
                Constitutional AI-powered governance with multi-LLM orchestration, bias mitigation, and ultra-low latency enforcement. 
                <span className="text-cyan-400"> Powered by NVIDIA + Groq.</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 rounded-lg border border-emerald-500/30">
                <div className="flex -space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-emerald-300 text-sm font-medium">Multi-AI Active</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <Scale className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Constitutional AI</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">Ultra-Low Latency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'generator', label: 'Policy Generator', icon: Brain },
            { id: 'validator', label: 'Policy Validator', icon: Shield },
            { id: 'monitor', label: 'Live Monitor', icon: Activity },
            { id: 'insights', label: 'Analytics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 relative group ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
              {activeTab === id && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg blur" />
              )}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <MetricCard
                title="Active Policies"
                value={realtimeMetrics.activePolicies}
                icon={FileText}
                color="blue"
                subtitle="Production ready"
              />
              <MetricCard
                title="Daily Decisions"
                value={realtimeMetrics.dailyDecisions.toLocaleString()}
                icon={Cpu}
                trend="+12.3%"
                color="emerald"
                subtitle="Last 24 hours"
              />
              <MetricCard
                title="Avg Latency"
                value={`${realtimeMetrics.avgLatency.toFixed(1)}ms`}
                icon={Zap}
                color="yellow"
                subtitle="Sub-25ms target"
              />
              <MetricCard
                title="Success Rate"
                value={`${realtimeMetrics.successRate.toFixed(1)}%`}
                icon={Target}
                trend="+0.2%"
                color="emerald"
                subtitle="SLA: 99.5%"
              />
              <MetricCard
                title="Bias Score"
                value={`${(realtimeMetrics.biasScore * 100).toFixed(1)}%`}
                icon={Scale}
                color="purple"
                subtitle="Constitutional AI"
              />
              <MetricCard
                title="Compliance"
                value={`${(realtimeMetrics.complianceScore * 100).toFixed(0)}%`}
                icon={Shield}
                trend="+1.8%"
                color="cyan"
                subtitle="Regulatory aligned"
              />
            </div>

            {/* Feature Cards */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Layers className="h-6 w-6 text-cyan-400" />
                AI Governance Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  title="Multi-LLM Policy Generation"
                  description="Generate governance policies using ensemble of NVIDIA Nemotron and Groq models with consensus validation."
                  icon={Brain}
                  status="active"
                  onClick={() => setActiveTab('generator')}
                />
                <FeatureCard
                  title="Constitutional AI Analysis"
                  description="Bias detection and mitigation across 9 social dimensions with democratic principle alignment."
                  icon={Scale}
                  status="active"
                  onClick={() => setActiveTab('validator')}
                />
                <FeatureCard
                  title="Ultra-Low Latency Enforcement"
                  description="Sub-25ms policy decisions with multi-tier caching and speculative execution optimization."
                  icon={Zap}
                  status="active"
                  onClick={() => setActiveTab('monitor')}
                />
                <FeatureCard
                  title="Real-time Governance Analytics"
                  description="Live monitoring of policy performance, bias trends, and compliance metrics with predictive insights."
                  icon={TrendingUp}
                  status="beta"
                  onClick={() => setActiveTab('insights')}
                />
                <FeatureCard
                  title="Stakeholder Impact Assessment"
                  description="AI-powered analysis of policy impacts across different stakeholder groups with mitigation strategies."
                  icon={Users}
                  status="beta"
                />
                <FeatureCard
                  title="Quantum-Enhanced Validation"
                  description="Quantum-inspired semantic fault tolerance with advanced error correction and verification."
                  icon={Globe}
                  status="coming-soon"
                />
              </div>
            </div>

            {/* System Health */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                System Health & Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">NVIDIA API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Operational</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Groq Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-400">Active</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Policy Engine</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-purple-400">Optimized</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Enhanced Generator Interface */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Multi-LLM Policy Generator</h2>
                  <p className="text-slate-400">Transform governance requirements into executable policies with AI consensus</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Logical Semantic Unit (Governance Requirement)
                  </label>
                  <textarea
                    value={lsuInput}
                    onChange={(e) => setLsuInput(e.target.value)}
                    className="w-full h-40 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    placeholder="Enter your governance requirement or policy need... For example: 'All user data must be encrypted with AES-256, access must be logged, and deletion requests must be processed within 30 days for GDPR compliance.'"
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-500">{lsuInput.length} characters</span>
                    <span className="text-xs text-slate-400">Minimum 20 characters recommended</span>
                  </div>
                </div>

                {/* Enhanced Options Grid */}
                <div className="bg-slate-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-cyan-400" />
                    Generation Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(generatorOptions).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setGeneratorOptions(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only"
                            disabled={isProcessing}
                          />
                          <div className={`w-6 h-6 rounded-lg border-2 transition-all ${
                            value 
                              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent' 
                              : 'border-slate-500 group-hover:border-slate-400'
                          }`}>
                            {value && (
                              <CheckCircle className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {key === 'enableBiasAssessment' && 'Analyze bias across 9 social dimensions'}
                            {key === 'enableConstitutionalAlignment' && 'Check alignment with democratic principles'}
                            {key === 'enableEnsembleValidation' && 'Multi-model consensus validation'}
                            {key === 'enableEnforcement' && 'Simulate policy enforcement scenarios'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateGovernance}
                  disabled={isProcessing || !lsuInput.trim() || lsuInput.length < 20}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 justify-center relative overflow-hidden group"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating AI Governance Package...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Generate Multi-LLM Governance Package</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Results Display */}
            {currentReport && (
              <div className="space-y-6">
                {/* Report Header with Enhanced Metrics */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Governance Package Generated</h3>
                        <p className="text-slate-400">Report ID: {currentReport.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600"
                    >
                      <Download className="h-4 w-4" />
                      Download Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title="Policy Artifacts"
                      value={currentReport.policy_artifacts.length}
                      icon={FileText}
                      color="blue"
                      subtitle="Generated files"
                    />
                    <MetricCard
                      title="Bias Score"
                      value={`${(currentReport.bias_assessment.overall_score * 100).toFixed(1)}%`}
                      icon={Scale}
                      color={currentReport.bias_assessment.overall_score < 0.3 ? 'emerald' : 
                             currentReport.bias_assessment.overall_score < 0.6 ? 'yellow' : 'red'}
                      subtitle="Constitutional AI"
                    />
                    <MetricCard
                      title="Compliance"
                      value={`${((currentReport.constitutional_alignment.reduce((sum, a) => sum + a.compliance_score, 0) / 
                        Math.max(currentReport.constitutional_alignment.length, 1)) * 100).toFixed(0)}%`}
                      icon={Shield}
                      color="emerald"
                      subtitle="Democratic principles"
                    />
                    <MetricCard
                      title="Enforcement Tests"
                      value={currentReport.enforcement_simulation.length}
                      icon={Zap}
                      color="purple"
                      subtitle="Scenarios tested"
                    />
                  </div>
                </div>

                {/* Enhanced Policy Artifacts Display */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Generated Policy Artifacts
                  </h3>
                  <div className="space-y-4">
                    {currentReport.policy_artifacts.map((artifact, index) => (
                      <div key={index} className="border border-slate-600/50 rounded-xl overflow-hidden hover:border-slate-500/50 transition-colors">
                        <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-600/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-cyan-400 font-semibold">{artifact.type}</span>
                              <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-300 rounded-full">
                                {artifact.generated_by}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-white">
                                  {(artifact.confidence_score * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-400">Confidence</div>
                              </div>
                              <Star className="h-4 w-4 text-yellow-400" />
                            </div>
                          </div>
                        </div>
                        <pre className="p-6 text-sm bg-slate-900/30 overflow-x-auto max-h-80 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                          <code className="text-slate-300">{artifact.content}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Bias Assessment */}
                {currentReport.bias_assessment && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Constitutional AI Bias Assessment
                    </h3>
                    
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                      {Object.entries(currentReport.bias_assessment.dimension_scores).map(([dimension, score]) => (
                        <div key={dimension} className="text-center p-3 bg-slate-900/30 rounded-lg">
                          <div className={`text-2xl font-bold mb-1 ${getBiasScoreColor(score)}`}>
                            {(score * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-400 capitalize">
                            {dimension.replace('_', ' ')}
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                            <div 
                              className={`h-1 rounded-full ${score < 0.3 ? 'bg-green-400' : score < 0.6 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentReport.bias_assessment.flagged_issues.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Flagged Issues
                        </h4>
                        <ul className="space-y-2">
                          {currentReport.bias_assessment.flagged_issues.map((issue, index) => (
                            <li key={index} className="text-yellow-200 text-sm flex items-start gap-2">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentReport.bias_assessment.mitigation_suggestions.length > 0 && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Mitigation Strategies
                        </h4>
                        <ul className="space-y-2">
                          {currentReport.bias_assessment.mitigation_suggestions.map((suggestion, index) => (
                            <li key={index} className="text-blue-200 text-sm flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Recommendations */}
                {currentReport.recommendations.length > 0 && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI Governance Recommendations
                    </h3>
                    <div className="grid gap-4">
                      {currentReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/30 transition-colors">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-400 text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className="text-emerald-200 font-medium">{recommendation}</span>
                          </div>
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
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Constitutional Policy Validator</h2>
                  <p className="text-slate-400">Real-time validation with bias assessment and compliance checking</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Policy Content (Rego, JSON, or Plain Text)
                  </label>
                  <textarea
                    value={policyInput}
                    onChange={(e) => setPolicyInput(e.target.value)}
                    className="w-full h-80 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-sm resize-none"
                    placeholder="Paste your policy content here for comprehensive validation..."
                    disabled={isProcessing}
                  />
                </div>

                <button
                  onClick={handleValidatePolicy}
                  disabled={isProcessing || !policyInput.trim()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Validating with Constitutional AI...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Validate Policy with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Validation Results */}
            {validationResult && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-6">Constitutional Validation Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <MetricCard
                    title="Validation Status"
                    value={validationResult.isValid ? 'Valid' : 'Issues Found'}
                    icon={validationResult.isValid ? CheckCircle : AlertTriangle}
                    color={validationResult.isValid ? 'emerald' : 'red'}
                    subtitle="Overall assessment"
                  />
                  <MetricCard
                    title="AI Confidence"
                    value={`${(validationResult.confidence * 100).toFixed(1)}%`}
                    icon={Brain}
                    color="blue"
                    subtitle="Analysis certainty"
                  />
                  <MetricCard
                    title="Issues Found"
                    value={validationResult.issues.length}
                    icon={AlertTriangle}
                    color="yellow"
                    subtitle="Requires attention"
                  />
                </div>

                {validationResult.issues.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-red-300 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Constitutional Issues Detected
                    </h4>
                    <div className="space-y-3">
                      {validationResult.issues.map((issue: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg">
                          <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            
                            <span className="text-red-400 text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-red-200 text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.suggestions.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Improvement Suggestions
                    </h4>
                    <div className="space-y-3">
                      {validationResult.suggestions.map((suggestion: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-blue-200 text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Real-time Enforcement Monitor</h2>
                <p className="text-slate-400">Ultra-low latency policy enforcement with live metrics</p>
              </div>
            </div>
            
            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Decisions / Second</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Live</span>
                </div>
                <div className="text-2xl font-bold text-white">247.3</div>
                <div className="mt-2 h-10">
                  <div className="flex items-end h-full space-x-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-cyan-400 rounded-sm w-full" 
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          opacity: 0.5 + Math.random() * 0.5
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Avg Latency (ms)</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">-12%</span>
                </div>
                <div className="text-2xl font-bold text-white">18.4</div>
                <div className="mt-2 h-10">
                  <div className="flex items-end h-full space-x-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-purple-400 rounded-sm w-full" 
                        style={{ 
                          height: `${30 + Math.random() * 70}%`,
                          opacity: 0.5 + Math.random() * 0.5
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Cache Hit Rate</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">+3.2%</span>
                </div>
                <div className="text-2xl font-bold text-white">87.4%</div>
                <div className="mt-2 h-10">
                  <div className="flex items-end h-full space-x-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-emerald-400 rounded-sm w-full" 
                        style={{ 
                          height: `${60 + Math.random() * 40}%`,
                          opacity: 0.5 + Math.random() * 0.5
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Error Rate</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">-0.1%</span>
                </div>
                <div className="text-2xl font-bold text-white">0.03%</div>
                <div className="mt-2 h-10">
                  <div className="flex items-end h-full space-x-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-red-400 rounded-sm w-full" 
                        style={{ 
                          height: `${Math.random() * 10}%`,
                          opacity: 0.5 + Math.random() * 0.5
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Decisions */}
            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Recent Policy Decisions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-700">
                      <th className="pb-3 text-sm font-semibold text-slate-400">Time</th>
                      <th className="pb-3 text-sm font-semibold text-slate-400">Policy</th>
                      <th className="pb-3 text-sm font-semibold text-slate-400">Action</th>
                      <th className="pb-3 text-sm font-semibold text-slate-400">Decision</th>
                      <th className="pb-3 text-sm font-semibold text-slate-400">Latency</th>
                      <th className="pb-3 text-sm font-semibold text-slate-400">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        <td className="py-3 text-sm text-slate-300">
                          {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                        </td>
                        <td className="py-3 text-sm text-slate-300">
                          <span className="font-mono">policy-{Math.floor(Math.random() * 1000)}</span>
                        </td>
                        <td className="py-3 text-sm text-slate-300">
                          {['read', 'write', 'delete', 'admin'][Math.floor(Math.random() * 4)]}
                        </td>
                        <td className="py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            Math.random() > 0.3 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {Math.random() > 0.3 ? 'Allow' : 'Deny'}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-300">
                          {(10 + Math.random() * 20).toFixed(1)}ms
                        </td>
                        <td className="py-3 text-sm text-slate-300">
                          {(0.8 + Math.random() * 0.2).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Governance Analytics</h2>
                <p className="text-slate-400">AI-powered insights and performance metrics</p>
              </div>
            </div>
            
            {/* Analytics Dashboard */}
            <div className="space-y-8">
              {/* Bias Trends */}
              <div className="bg-slate-900/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-yellow-400" />
                  Bias Reduction Trends
                </h3>
                <div className="h-64 w-full">
                  <div className="flex h-full items-end">
                    {['Gender', 'Age', 'Race', 'Socioeconomic', 'Religion', 'Disability', 'Geographic'].map((dim, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-red-500/30 rounded-t-sm" 
                            style={{ height: `${20 + Math.random() * 20}px` }}
                          ></div>
                          <div 
                            className="w-full bg-yellow-500/30 rounded-t-sm" 
                            style={{ height: `${20 + Math.random() * 30}px` }}
                          ></div>
                          <div 
                            className="w-full bg-green-500/30 rounded-t-sm" 
                            style={{ height: `${100 + Math.random() * 100}px` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 mt-2 rotate-45 origin-top-left">{dim}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-8 space-x-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500/30 rounded-sm"></div>
                    <span className="text-xs text-slate-400">Low Bias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500/30 rounded-sm"></div>
                    <span className="text-xs text-slate-400">Medium Bias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/30 rounded-sm"></div>
                    <span className="text-xs text-slate-400">High Bias</span>
                  </div>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-400" />
                    Latency Distribution
                  </h3>
                  <div className="h-48">
                    <div className="flex h-full items-end">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500/30 to-blue-500/30 rounded-t-sm" 
                            style={{ height: `${Math.max(10, 100 * Math.exp(-Math.pow((i-10)/5, 2)))}px` }}
                          ></div>
                          {i % 5 === 0 && (
                            <span className="text-xs text-slate-400 mt-2">{i*5}ms</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Compliance by Principle
                  </h3>
                  <div className="space-y-4">
                    {['Fairness', 'Transparency', 'Accountability', 'Privacy', 'Safety'].map((principle, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">{principle}</span>
                          <span className="text-sm text-emerald-400 font-semibold">
                            {(70 + Math.random() * 30).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full" 
                            style={{ width: `${70 + Math.random() * 30}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGovernanceDashboard;
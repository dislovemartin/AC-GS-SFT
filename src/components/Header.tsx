import React from 'react';
import { Shield, Cpu, Zap, Brain, Scale } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur opacity-75"></div>
              <div className="relative bg-slate-900 p-2 rounded-full">
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                QEC-SFT Platform
              </h1>
              <p className="text-sm text-slate-400">
                AI-Powered Governance & Semantic Fault Tolerance
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {/* Multi-AI Status */}
            <div className="flex items-center gap-2 text-slate-400">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Multi-AI</span>
            </div>
            
            {/* Constitutional AI Status */}
            <div className="flex items-center gap-2 text-slate-400">
              <Scale className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">Constitutional AI</span>
            </div>
            
            {/* Version */}
            <div className="flex items-center gap-2 text-slate-400">
              <Cpu className="h-4 w-4" />
              <span className="text-sm">v8.2.0</span>
            </div>
            
            {/* Demo Mode */}
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Enhanced Mode</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
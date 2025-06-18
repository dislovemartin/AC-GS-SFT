import { intentParser, ParsedIntent } from './intent-parser';
import { promptLibrary, PromptTemplate } from './prompt-library';
import { ragModule, RetrievalResult } from './rag-module';
import { sentinelSystem, SentinelReport } from './sentinel-system';

export interface CompilationResult {
  success: boolean;
  response?: string;
  error?: string;
  metadata: {
    intent: ParsedIntent;
    template: PromptTemplate;
    retrieval: RetrievalResult;
    sentinel: SentinelReport;
    compiledPrompt: string;
    processingTime: number;
  };
}

export interface FeedbackSignal {
  templateId: string;
  intent: ParsedIntent;
  sentinelReport: SentinelReport;
  userFeedback?: {
    helpful: boolean;
    accurate: boolean;
    comments?: string;
  };
  timestamp: Date;
}

export class PromptCompiler {
  private feedbackLog: FeedbackSignal[] = [];

  async compileAndExecute(
    query: string,
    mockLLMResponse?: string // For testing without actual LLM
  ): Promise<CompilationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Parse Intent
      const intent = intentParser.parseIntent(query);
      
      // Step 2: Get Champion Prompt Template
      const template = promptLibrary.getChampionPrompt(intent.type);
      if (!template) {
        return {
          success: false,
          error: `No prompt template found for intent: ${intent.type}`,
          metadata: {
            intent,
            template: null as any,
            retrieval: null as any,
            sentinel: null as any,
            compiledPrompt: '',
            processingTime: Date.now() - startTime
          }
        };
      }

      // Step 3: Retrieve Context (RAG)
      const retrieval = ragModule.retrieveDocuments(
        query, 
        5, 
        intent.domain, 
        intent.riskLevel === 'high' ? 0.8 : 0.7
      );

      // Step 4: Compile Final Prompt
      const context = ragModule.formatContext(retrieval.documents);
      const compiledPrompt = promptLibrary.compilePrompt(template, context, query);

      // Step 5: Execute (Mock or Real LLM)
      const llmResponse = mockLLMResponse || await this.executeLLM(compiledPrompt);

      // Step 6: Sentinel Verification
      const sentinel = await sentinelSystem.verifyResponse(
        llmResponse,
        retrieval.documents,
        query,
        intent.riskLevel
      );

      // Step 7: Log Usage and Feedback
      promptLibrary.incrementUsage(template.id);
      this.logFeedback({
        templateId: template.id,
        intent,
        sentinelReport: sentinel,
        timestamp: new Date()
      });

      // Step 8: Determine Response
      const finalResponse = sentinel.shouldRelease 
        ? llmResponse 
        : this.generateSafeResponse(intent, sentinel);

      return {
        success: true,
        response: finalResponse,
        metadata: {
          intent,
          template,
          retrieval,
          sentinel,
          compiledPrompt,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown compilation error',
        metadata: {
          intent: null as any,
          template: null as any,
          retrieval: null as any,
          sentinel: null as any,
          compiledPrompt: '',
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private async executeLLM(prompt: string): Promise<string> {
    // Mock LLM execution - in real implementation, this would call actual LLM API
    const responses = {
      medical: "Based on the provided clinical data, acetaminophen (paracetamol) is an effective analgesic with a standard adult dose of 500-1000mg every 4-6 hours. [Source: FDA Drug Database] The maximum daily dose should not exceed 4000mg to prevent liver toxicity. Common side effects include nausea and skin rash, though serious adverse events are rare when used as directed. Patients with existing liver disease should use caution and consult healthcare providers before use.",
      
      financial: "The S&P 500 index represents the performance of 500 large-cap US companies and is widely considered a benchmark for the overall US stock market. [Source: Financial Industry Regulatory Authority] As a market-capitalization-weighted index, larger companies have greater influence on the index value. Historical data shows average annual returns of approximately 10% over long periods, though individual years can vary significantly. Investment in index funds tracking the S&P 500 provides broad market exposure but does not guarantee profits and carries inherent market risks.",
      
      technical: "HTTP (Hypertext Transfer Protocol) is the foundation of data communication on the World Wide Web. [Source: Mozilla Developer Network] It operates as a stateless, application-layer protocol using a request-response model between clients and servers. Common HTTP methods include GET for retrieving data, POST for submitting data, PUT for updating resources, and DELETE for removing resources. Each HTTP request contains headers with metadata and may include a message body for data transmission.",
      
      default: "Based on the available information and context provided, I can offer the following response. However, please note that this information should be verified against current, authoritative sources for the most up-to-date and accurate details. If you require specific professional advice, please consult with qualified experts in the relevant field."
    };

    // Simple prompt analysis to return appropriate mock response
    if (prompt.toLowerCase().includes('medical') || prompt.toLowerCase().includes('drug')) {
      return responses.medical;
    } else if (prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('s&p')) {
      return responses.financial;
    } else if (prompt.toLowerCase().includes('http') || prompt.toLowerCase().includes('protocol')) {
      return responses.technical;
    } else {
      return responses.default;
    }
  }

  private generateSafeResponse(intent: ParsedIntent, sentinel: SentinelReport): string {
    const domain = intent.domain;
    const issues = Object.values(sentinel.verificationResults)
      .flatMap(result => result.issues)
      .join(', ');

    return `I cannot provide a reliable response to this ${domain} query due to verification concerns: ${issues}. 

For accurate information on this topic, I recommend:
1. Consulting authoritative sources in the ${domain} domain
2. Speaking with qualified professionals if this involves personal decisions
3. Verifying any information through multiple trusted sources

Risk Level: ${sentinel.riskLevel.toUpperCase()}
Verification Score: ${(sentinel.overallScore * 100).toFixed(1)}%`;
  }

  logUserFeedback(
    templateId: string, 
    feedback: { helpful: boolean; accurate: boolean; comments?: string }
  ): void {
    // Find the most recent feedback signal for this template
    const recentSignal = this.feedbackLog
      .filter(signal => signal.templateId === templateId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (recentSignal) {
      recentSignal.userFeedback = feedback;
      
      // Update template performance based on feedback
      this.updateTemplatePerformance(templateId, feedback);
    }
  }

  private updateTemplatePerformance(
    templateId: string, 
    feedback: { helpful: boolean; accurate: boolean }
  ): void {
    // Simple performance update based on user feedback
    const helpfulScore = feedback.helpful ? 0.1 : -0.1;
    const accuracyScore = feedback.accurate ? 0.1 : -0.1;

    promptLibrary.updateTemplatePerformance(templateId, {
      accuracy: accuracyScore, // This would be added to existing score with proper bounds
      factuality: accuracyScore
    });
  }

  private logFeedback(signal: FeedbackSignal): void {
    this.feedbackLog.push(signal);
    
    // Keep only recent feedback (last 1000 entries)
    if (this.feedbackLog.length > 1000) {
      this.feedbackLog = this.feedbackLog.slice(-1000);
    }
  }

  // Get feedback data for evolution engine
  getFeedbackLog(): FeedbackSignal[] {
    return [...this.feedbackLog]; // Return copy
  }

  // Get system performance statistics
  getSystemStats(): any {
    const recentSignals = this.feedbackLog.filter(
      signal => Date.now() - signal.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentSignals.length === 0) {
      return {
        totalQueries: 0,
        avgOverallScore: 0,
        avgProcessingTime: 0,
        riskDistribution: {},
        intentDistribution: {},
        releaseRate: 0
      };
    }

    const stats = {
      totalQueries: recentSignals.length,
      avgOverallScore: recentSignals.reduce((sum, s) => sum + s.sentinelReport.overallScore, 0) / recentSignals.length,
      avgProcessingTime: 0, // Would need to track this
      riskDistribution: {} as Record<string, number>,
      intentDistribution: {} as Record<string, number>,
      releaseRate: recentSignals.filter(s => s.sentinelReport.shouldRelease).length / recentSignals.length
    };

    // Calculate distributions
    recentSignals.forEach(signal => {
      const risk = signal.sentinelReport.riskLevel;
      const intent = signal.intent.type;
      
      stats.riskDistribution[risk] = (stats.riskDistribution[risk] || 0) + 1;
      stats.intentDistribution[intent] = (stats.intentDistribution[intent] || 0) + 1;
    });

    return stats;
  }

  // Get detailed analysis for a specific query type
  getPerformanceAnalysis(intentType?: string): any {
    const filteredSignals = intentType 
      ? this.feedbackLog.filter(s => s.intent.type === intentType)
      : this.feedbackLog;

    if (filteredSignals.length === 0) return null;

    const analysis = {
      intentType,
      totalSamples: filteredSignals.length,
      avgVerificationScores: {
        consistency: 0,
        grounding: 0,
        factChecking: 0,
        overall: 0
      },
      commonIssues: {} as Record<string, number>,
      userSatisfaction: {
        helpful: 0,
        accurate: 0,
        totalFeedback: 0
      },
      releaseRate: filteredSignals.filter(s => s.sentinelReport.shouldRelease).length / filteredSignals.length
    };

    // Calculate averages
    filteredSignals.forEach(signal => {
      const results = signal.sentinelReport.verificationResults;
      analysis.avgVerificationScores.consistency += results.consistency.score;
      analysis.avgVerificationScores.grounding += results.grounding.score;
      analysis.avgVerificationScores.overall += signal.sentinelReport.overallScore;
      
      if (results.factChecking) {
        analysis.avgVerificationScores.factChecking += results.factChecking.score;
      }

      // Aggregate common issues
      Object.values(results).forEach(result => {
        result.issues.forEach(issue => {
          analysis.commonIssues[issue] = (analysis.commonIssues[issue] || 0) + 1;
        });
      });

      // User feedback statistics
      if (signal.userFeedback) {
        analysis.userSatisfaction.totalFeedback++;
        if (signal.userFeedback.helpful) analysis.userSatisfaction.helpful++;
        if (signal.userFeedback.accurate) analysis.userSatisfaction.accurate++;
      }
    });

    // Normalize averages
    const count = filteredSignals.length;
    analysis.avgVerificationScores.consistency /= count;
    analysis.avgVerificationScores.grounding /= count;
    analysis.avgVerificationScores.overall /= count;
    
    const factCheckingCount = filteredSignals.filter(s => s.sentinelReport.verificationResults.factChecking).length;
    if (factCheckingCount > 0) {
      analysis.avgVerificationScores.factChecking /= factCheckingCount;
    }

    return analysis;
  }
}

export const promptCompiler = new PromptCompiler();
import { Document } from './rag-module';

export interface VerificationResult {
  score: number; // 0-1
  confidence: number; // 0-1
  issues: string[];
  details: any;
}

export interface SentinelReport {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  shouldRelease: boolean;
  verificationResults: {
    consistency: VerificationResult;
    grounding: VerificationResult;
    factChecking?: VerificationResult;
  };
  timestamp: Date;
  processingTime: number;
}

export class SentinelSystem {
  private consistencyChecker: ConsistencyChecker;
  private groundingChecker: GroundingChecker;
  private factChecker: FactChecker;

  constructor() {
    this.consistencyChecker = new ConsistencyChecker();
    this.groundingChecker = new GroundingChecker();
    this.factChecker = new FactChecker();
  }

  async verifyResponse(
    response: string,
    retrievedContext: Document[],
    query: string,
    riskLevel: 'low' | 'medium' | 'high'
  ): Promise<SentinelReport> {
    const startTime = Date.now();

    // Always run consistency and grounding checks
    const [consistency, grounding] = await Promise.all([
      this.consistencyChecker.checkConsistency(response, query),
      this.groundingChecker.checkGrounding(response, retrievedContext)
    ]);

    const verificationResults: SentinelReport['verificationResults'] = {
      consistency,
      grounding
    };

    // Run fact-checking for high-risk queries
    if (riskLevel === 'high') {
      verificationResults.factChecking = await this.factChecker.checkFacts(response, query);
    }

    const overallScore = this.calculateOverallScore(verificationResults);
    const shouldRelease = this.determineRelease(overallScore, riskLevel);

    return {
      overallScore,
      riskLevel,
      shouldRelease,
      verificationResults,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    };
  }

  private calculateOverallScore(results: SentinelReport['verificationResults']): number {
    const weights = {
      consistency: 0.3,
      grounding: 0.4,
      factChecking: 0.3
    };

    let totalWeight = weights.consistency + weights.grounding;
    let weightedSum = 
      results.consistency.score * weights.consistency +
      results.grounding.score * weights.grounding;

    if (results.factChecking) {
      totalWeight += weights.factChecking;
      weightedSum += results.factChecking.score * weights.factChecking;
    }

    return weightedSum / totalWeight;
  }

  private determineRelease(overallScore: number, riskLevel: 'low' | 'medium' | 'high'): boolean {
    const thresholds = {
      low: 0.6,
      medium: 0.7,
      high: 0.8
    };

    return overallScore >= thresholds[riskLevel];
  }
}

class ConsistencyChecker {
  async checkConsistency(response: string, query: string): Promise<VerificationResult> {
    const issues: string[] = [];
    let score = 1.0;
    
    // Check for internal contradictions
    const contradictions = this.findContradictions(response);
    if (contradictions.length > 0) {
      issues.push(`Found ${contradictions.length} potential contradictions`);
      score -= contradictions.length * 0.2;
    }

    // Check for logical coherence
    const coherenceScore = this.checkLogicalCoherence(response);
    if (coherenceScore < 0.7) {
      issues.push('Response lacks logical coherence');
      score -= (1 - coherenceScore) * 0.3;
    }

    // Check query relevance
    const relevanceScore = this.checkQueryRelevance(response, query);
    if (relevanceScore < 0.6) {
      issues.push('Response does not adequately address the query');
      score -= (1 - relevanceScore) * 0.4;
    }

    return {
      score: Math.max(score, 0),
      confidence: 0.8, // Confidence in our consistency checking
      issues,
      details: {
        contradictions,
        coherenceScore,
        relevanceScore
      }
    };
  }

  private findContradictions(text: string): string[] {
    const contradictions: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple contradiction detection patterns
    const contradictionPatterns = [
      [/\bis\s+not\b/i, /\bis\b/i],
      [/\bno\b/i, /\byes\b/i],
      [/\balways\b/i, /\bnever\b/i],
      [/\bincreases?\b/i, /\bdecreases?\b/i],
      [/\bsafe\b/i, /\bdangerous\b/i],
      [/\beffective\b/i, /\bineffective\b/i]
    ];

    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        for (const [pattern1, pattern2] of contradictionPatterns) {
          if (pattern1.test(sentences[i]) && pattern2.test(sentences[j])) {
            contradictions.push(`Sentences ${i + 1} and ${j + 1} may contradict`);
          }
        }
      }
    }

    return contradictions;
  }

  private checkLogicalCoherence(text: string): number {
    // Simple heuristics for logical coherence
    let score = 1.0;
    
    // Check for proper flow indicators
    const flowIndicators = /\b(first|second|third|next|then|finally|however|therefore|because|since|although)\b/gi;
    const matches = text.match(flowIndicators);
    const flowScore = matches ? Math.min(matches.length / 5, 1) : 0.3;
    
    // Check for repeated ideas (may indicate lack of structure)
    const sentences = text.split(/[.!?]+/);
    const uniqueContent = new Set(sentences.map(s => s.trim().toLowerCase()));
    const uniquenessScore = uniqueContent.size / Math.max(sentences.length, 1);
    
    return (flowScore * 0.6) + (uniquenessScore * 0.4);
  }

  private checkQueryRelevance(response: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase().split(/\s+/);
    
    const relevantWords = queryWords.filter(word => 
      word.length > 3 && responseWords.some(rw => rw.includes(word) || word.includes(rw))
    );
    
    return relevantWords.length / Math.max(queryWords.filter(w => w.length > 3).length, 1);
  }
}

class GroundingChecker {
  async checkGrounding(response: string, retrievedDocs: Document[]): Promise<VerificationResult> {
    const issues: string[] = [];
    let score = 1.0;

    if (retrievedDocs.length === 0) {
      issues.push('No context documents available for grounding verification');
      return {
        score: 0.3,
        confidence: 0.9,
        issues,
        details: { contextAvailable: false }
      };
    }

    // Extract claims from response
    const claims = this.extractClaims(response);
    const contextContent = retrievedDocs.map(doc => doc.content).join(' ');
    
    // Check each claim against context
    let supportedClaims = 0;
    const claimAnalysis: any[] = [];

    for (const claim of claims) {
      const isSupported = this.isClaimSupported(claim, contextContent, retrievedDocs);
      if (isSupported.supported) {
        supportedClaims++;
      } else {
        issues.push(`Unsupported claim: "${claim.substring(0, 50)}..."`);
      }
      claimAnalysis.push({
        claim: claim.substring(0, 100),
        supported: isSupported.supported,
        confidence: isSupported.confidence,
        source: isSupported.source
      });
    }

    // Calculate grounding score
    const groundingScore = claims.length > 0 ? supportedClaims / claims.length : 0.5;
    
    // Check for source citations
    const hasCitations = /\[Source \d+:/g.test(response);
    if (!hasCitations && retrievedDocs.length > 0) {
      issues.push('Response lacks proper source citations');
      score -= 0.2;
    }

    return {
      score: Math.min(groundingScore * score, 1),
      confidence: 0.85,
      issues,
      details: {
        totalClaims: claims.length,
        supportedClaims,
        claimAnalysis,
        hasCitations,
        sourcesUsed: retrievedDocs.length
      }
    };
  }

  private extractClaims(text: string): string[] {
    // Split text into sentences and filter for factual claims
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Simple heuristic: sentences with specific patterns are likely factual claims
    return sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return (
        /\b(is|are|was|were|has|have|contains?|includes?|shows?|indicates?|reports?)\b/.test(lowerSentence) ||
        /\b\d+(\.\d+)?(%|mg|ml|units|percent|dollars?)\b/.test(sentence) ||
        /\b(according to|studies show|research indicates|data suggests)\b/i.test(sentence)
      );
    });
  }

  private isClaimSupported(claim: string, context: string, docs: Document[]): {
    supported: boolean;
    confidence: number;
    source?: string;
  } {
    const claimWords = claim.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Check word overlap
    const overlap = claimWords.filter(word => 
      contextWords.some(cw => cw.includes(word) || word.includes(cw))
    );
    
    const overlapScore = overlap.length / Math.max(claimWords.length, 1);
    
    // Find best supporting document
    let bestSupport = 0;
    let bestSource = '';
    
    for (const doc of docs) {
      const docWords = doc.content.toLowerCase().split(/\s+/);
      const docOverlap = claimWords.filter(word => 
        docWords.some(dw => dw.includes(word) || word.includes(dw))
      );
      const docScore = docOverlap.length / Math.max(claimWords.length, 1);
      
      if (docScore > bestSupport) {
        bestSupport = docScore;
        bestSource = doc.metadata.source;
      }
    }

    return {
      supported: overlapScore > 0.4,
      confidence: Math.min(overlapScore * 1.5, 1),
      source: bestSource
    };
  }
}

class FactChecker {
  async checkFacts(response: string, query: string): Promise<VerificationResult> {
    const issues: string[] = [];
    let score = 0.8; // Default score when we can't verify everything

    // Extract factual statements
    const factualStatements = this.extractFactualStatements(response);
    
    // Simple fact checking heuristics (in production, this would use external APIs)
    const suspiciousPatterns = [
      /\b(definitely|certainly|absolutely|never|always|completely|totally)\b/gi,
      /\b100%\b/g,
      /\bcures?\b/gi,
      /\bguaranteed?\b/gi
    ];

    let suspiciousCount = 0;
    suspiciousPatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches) {
        suspiciousCount += matches.length;
      }
    });

    if (suspiciousCount > 0) {
      issues.push(`Found ${suspiciousCount} potentially overstated claims`);
      score -= suspiciousCount * 0.1;
    }

    // Check for specific red flags in medical/financial domains
    const medicalRedFlags = /\b(cure cancer|prevents? all|miracle|instant relief)\b/gi;
    const financialRedFlags = /\b(guaranteed profits?|risk-free|get rich quick|never lose)\b/gi;
    
    if (medicalRedFlags.test(response)) {
      issues.push('Contains potentially misleading medical claims');
      score -= 0.3;
    }
    
    if (financialRedFlags.test(response)) {
      issues.push('Contains potentially misleading financial claims');
      score -= 0.3;
    }

    // Check for proper uncertainty expressions
    const uncertaintyExpressions = /\b(may|might|could|possibly|likely|appears|seems|suggests)\b/gi;
    const uncertaintyCount = (response.match(uncertaintyExpressions) || []).length;
    const responseLength = response.split(/\s+/).length;
    const uncertaintyRatio = uncertaintyCount / Math.max(responseLength / 50, 1);
    
    if (uncertaintyRatio < 0.1 && factualStatements.length > 3) {
      issues.push('Response may be too definitive given the complexity of the topic');
      score -= 0.1;
    }

    return {
      score: Math.max(score, 0),
      confidence: 0.7, // Lower confidence as this is simplified fact checking
      issues,
      details: {
        factualStatements,
        suspiciousPatterns: suspiciousCount,
        uncertaintyRatio,
        redFlags: {
          medical: medicalRedFlags.test(response),
          financial: financialRedFlags.test(response)
        }
      }
    };
  }

  private extractFactualStatements(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    return sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return (
        /\b(studies show|research indicates|according to|data shows|evidence suggests)\b/.test(lowerSentence) ||
        /\b\d+(\.\d+)?(%|mg|ml|units|percent|dollars?|years?|months?|days?)\b/.test(sentence) ||
        /\b(approved by|regulated by|licensed|certified)\b/i.test(sentence)
      );
    });
  }
}

export const sentinelSystem = new SentinelSystem();